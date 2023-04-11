import * as functions from "firebase-functions";
import {defineSecret} from "firebase-functions/params";
import Stripe from "stripe";
import {Product} from "./types.js";

const stripePrivateKey = defineSecret("STRIPE_API_SK");

export const onWriteProduct = functions
    .runWith({secrets: [stripePrivateKey]})
    .region("europe-west3").firestore
    .document("products/{productId}")
    .onWrite(async (change, context) => {
      const before = change.before.exists ?
      change.before.data() as Product : null;
      const after = change.after.exists ?
        change.after.data() as Product : null;

      const stripe = new Stripe(stripePrivateKey.value(),
          {apiVersion: "2022-11-15"});

      functions.logger.log(context.params.productId);

      if (!before && after) {
        await stripe.products.create({
          id: context.params.productId,
          default_price_data: {
            currency: "eur",
            unit_amount: (after.price || 0) * 100,
          },
          name: after.name,
          images: after.image ? [after.image.url] : [],
          // url: `localhost:3000/products/${after.slug}`,
        });
      }

      if (before && after) {
        const product = await stripe
            .products.retrieve(context.params.productId);
        let defaultPrice = product.default_price;
        if (before.price !== after.price) {
          if (typeof defaultPrice === "string") {
            await stripe.prices.update(defaultPrice, {active: false});
          }

          const price = await stripe.prices.create({
            product: product.id,
            currency: "eur",
            unit_amount: (after.price || 0) * 100,
          });
          defaultPrice = price.id;
        }

        await stripe.products.update(context.params.productId, {
          name: after.name,
          images: after.image ? [after.image.url] : [],
          // url: `localhost:3000/products/${after.slug}`,
          ...(before.price !== after.price &&
            typeof defaultPrice === "string" ? {
              default_price: defaultPrice,
            } : {}),
        });

        return;
      }

      if (before && !after) {
        await stripe.products.del(context.params.productId);
        return;
      }
    });
