import * as functions from "firebase-functions";
import {defineSecret} from "firebase-functions/params";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import Stripe from "stripe";
import {orderConverter, productConverter} from "./types.js";
import QRCode from "qrcode";
import axios from "axios";

const stripePrivateKey = defineSecret("STRIPE_API_SK");
const stripeWebhook = defineSecret("STRIPE_API_WHSEC");

type ProductFromCheckout = {
  id: string
  quantity: number
  soldNb: number
}

export const onCompleteCheckoutSession = functions
    .runWith({
      secrets: [stripePrivateKey, stripeWebhook],
    })
    .region("europe-west3")
    .https.onRequest(async (req, res) => {
      const signature = req.headers["stripe-signature"] as string;
      if (!signature) {
        throw new functions.https
            .HttpsError("internal", "Une erreur s'est produite");
      }

      const stripe = new Stripe(stripePrivateKey.value(), {
        apiVersion: "2022-11-15"});
      const firestore = getFirestore();

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            signature,
            stripeWebhook.value()
        );
      } catch (err) {
        throw new functions.https.HttpsError("internal", "Webhook Error", err);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const orderRef = firestore.collection("orders")
            .withConverter(orderConverter).doc(session.id);

        const orderUrl = `http://localhost:3000/admin/commandes/${session.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(orderUrl);
        const imageResponse = await axios.get(qrCodeDataUrl, {
          responseType: "arraybuffer",
        });

        const qrCodeBuffer = Buffer.from(imageResponse.data, "binary");
        const bucket = getStorage().bucket();

        const qrCodeFile = bucket.file(`orders/${session.id}`);
        await qrCodeFile.save(qrCodeBuffer, {
          contentType: "image/png",
        });

        const qrCodeUrl = await qrCodeFile.getSignedUrl({
          action: "read",
          expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
        }).then((urls) => urls[0]);

        await orderRef.update({
          paymentStatus: session.payment_status,
          status: "paid",
          updateDate: Timestamp.now(),
          qrCodeUrl,
        });

        const products = JSON.parse(session.metadata?.products || "[]");

        await Promise.all(products.map(async (product: ProductFromCheckout) => {
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

      res.status(200).send("OK");
    });
