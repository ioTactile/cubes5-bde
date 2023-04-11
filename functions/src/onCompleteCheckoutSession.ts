import * as functions from "firebase-functions";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {defineSecret} from "firebase-functions/params";
import Stripe from "stripe";
import {orderConverter} from "./types.js";

const stripePrivateKey = defineSecret("STRIPE_API_SK");
const stripeWebhook = defineSecret("STRIPE_API_WHSEC");

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
      //   const bucket = getStorage().bucket("gs://cubes5-bde-fbfeb.appspot.com");

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

      //   const orderUrl = `http://localhost:3000/admin/commandes/${event.data.object.id}`;

      //   const qrCodeDataUrl = await QRCode.toDataURL(orderUrl);
      //   const imageResponse = await axios.get(qrCodeDataUrl, {
      //     responseType: "blob",
      //   });
      //   const qrCodeBlob = imageResponse.data;
      //   const qrCodeRef = storage.ref(`qrcodes/${event.data.object.id}.png`);
      //   await qrCodeRef.put(qrCodeBlob);

      //   const qrCodeUrl = await qrCodeRef.getDownloadURL();

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderRef = firestore.collection("orders")
            .withConverter(orderConverter).doc(session.id);
        await orderRef.update({
          paymentStatus: session.payment_status,
          status: "paid",
          updateDate: Timestamp.now(),
        //   qrCodeUrl,
        });
      }


      res.status(200).send("OK");
    });
