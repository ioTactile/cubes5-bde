import * as functions from "firebase-functions";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

export type Data = {
    email: string,
    password: string,
    role: unknown
}

export const createAdmin = functions
    .region("europe-west3")
    .https.onCall(async (data: Data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated", "Une authentification est nécessaire");
      }
      if (!data.email || !data.password || !data.role) {
        throw new functions.https
            .HttpsError("invalid-argument", "Paramètres incorrect");
      }

      const auth = getAuth();
      const firestore = getFirestore();

      const user = await auth.createUser({
        email: data.email,
        password: data.password,
      });
      await auth.setCustomUserClaims(user.uid, data.role);

      const date = new Date(Date.now());
      const newUser = {
        id: user.uid,
        email: data.email,
        role: data.role,
        creationDate: Timestamp.fromDate(date),
        updateDate: Timestamp.now(),
      };
      await firestore
          .collection("users").doc(user.uid).set(newUser, {merge: true});

      return newUser;
    });
