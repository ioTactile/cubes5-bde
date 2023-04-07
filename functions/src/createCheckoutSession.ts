import * as functions from "firebase-functions";
import {defineSecret} from "firebase-functions/params";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import Stripe from "stripe";
import {BasketProduct, orderConverter, productConverter} from "./types.js";

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
                price: product.price,
                image: product.image,
                quantity: product.quantity,
              })),
              methods: data.paymentMethod,
              creationDate: Timestamp.now(),
              updateDate: Timestamp.now(),
            });
      } else if (data.paymentMethod === "cash") {
        const ordersRef = firestore.collection("orders")
            .withConverter(orderConverter);
        orderRef = ordersRef.doc();
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
            price: product.price,
            image: product.image,
            quantity: product.quantity,
          })),
          methods: data.paymentMethod,
          creationDate: Timestamp.now(),
          updateDate: Timestamp.now(),
        });
      }

      return {sessionId: session?.id, orderId: orderRef?.id};
    });
