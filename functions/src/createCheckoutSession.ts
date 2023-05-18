import * as functions from "firebase-functions";
import {defineSecret} from "firebase-functions/params";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import Stripe from "stripe";
import {BasketProduct, orderConverter, productConverter} from "./types.js";
import QRCode from "qrcode";
import axios from "axios";

const stripePrivateKey = defineSecret("STRIPE_API_SK");

export type Data = {
    basket: Record < string, number >,
    firstName: string,
    lastName: string,
    email: string,
    paymentMethod: string,
}

export const createCheckoutSession = functions
    .runWith({
      secrets: [stripePrivateKey],
    })
    .region("europe-west3")
    .https.onCall(async (data: Data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Une authentification est nécessaire"
        );
      }
      if (!data.basket || !data.firstName || !data.lastName || !data.email) {
        throw new functions.https.HttpsError(
            "invalid-argument", "Paramètres incorrect");
      }

      let session;
      let orderRef;

      const firestore = getFirestore();
      const stripe = new Stripe(stripePrivateKey.value(),
          {apiVersion: "2022-11-15"});

      const products = (await Promise.all(Object.keys(data.basket)
          .map(async (productId) => {
            const productRef = firestore.collection("products")
                .doc(productId).withConverter(productConverter);
            const product = await productRef.get();
            return {
              ...product.data(),
              id: product.id,
              quantity: data.basket[productId],
            };
          }))).filter((product): product is BasketProduct => !!product);

      functions.logger.log("products", products);

      if (data.paymentMethod === "card") {
        const lineItems = await Promise.all(products.map(async (product) => {
          const stripeProduct = await stripe.products.retrieve(product.id);
          const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            quantity: product.quantity,
          };
          if (typeof stripeProduct.default_price === "string") {
            lineItem.price = stripeProduct.default_price;
          }
          return lineItem;
        }));

        const checkoutParams: Stripe.Checkout.SessionCreateParams = {
          customer_email: data.email,
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          currency: "eur",
          success_url: `${context.rawRequest.headers.origin}/success`,
          cancel_url: `${context.rawRequest.headers.origin}/panier`,
          metadata: {
            products: JSON.stringify(products.map((product) => ({
              id: product.id,
              quantity: product.quantity,
              soldNb: product.soldNb,
            }))),
          },
        };

        session = await stripe.checkout.sessions.create(checkoutParams);

        await firestore.collection("orders").withConverter(orderConverter)
            .doc(session.id).set({
              id: session.id,
              userId: context.auth.uid,
              userInformations: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
              },
              products: products.map((product) => ({
                id: product.id,
                name: product.name,
                price: (product.price || 0),
                image: product.image,
                quantity: product.quantity,
              })),
              methods: data.paymentMethod,
              paymentStatus: session.payment_status,
              status: "pending",
              creationDate: Timestamp.now(),
              updateDate: Timestamp.now(),
            });
      } else if (data.paymentMethod === "cash") {
        const ordersRef = firestore.collection("orders")
            .withConverter(orderConverter);
        orderRef = ordersRef.doc();

        const orderUrl = `http://localhost:3000/admin/commandes/${orderRef.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(orderUrl);
        const imageResponse = await axios.get(qrCodeDataUrl, {
          responseType: "arraybuffer",
        });

        const qrCodeBuffer = Buffer.from(imageResponse.data, "binary");
        const bucket = getStorage().bucket();

        const qrCodeFile = bucket.file(`orders/${orderRef.id}`);
        await qrCodeFile.save(qrCodeBuffer, {
          contentType: "image/png",
        });

        const qrCodeUrl = await qrCodeFile.getSignedUrl({
          action: "read",
          expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
        }).then((urls) => urls[0]);

        await orderRef.set({
          id: orderRef.id,
          userId: context.auth.uid,
          userInformations: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          },
          products: products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            image: product.image,
            quantity: product.quantity,
          })),
          methods: data.paymentMethod,
          status: "pending",
          qrCodeUrl,
          creationDate: Timestamp.now(),
          updateDate: Timestamp.now(),
        });

        await Promise.all(products.map(async (product) => {
          const productRef = firestore.collection("products")
              .doc(product.id).withConverter(productConverter);
          const productDoc = await productRef.get();
          if (productDoc.exists) {
            const productData = productDoc.data();
            if (productData) {
              await productRef.update({
                soldNb: (productData.soldNb || 0) + product.quantity,
                quantity: (productData.quantity || 0) - product.quantity,
              });
            }
          }
        }));
      }

      return {sessionId: session?.id, orderId: orderRef?.id};
    });
