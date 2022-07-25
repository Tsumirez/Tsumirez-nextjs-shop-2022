const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method === 'POST') {

    try {
      const params = {
          submit_type : 'pay',
          mode : 'payment',
          payment_method_types: ['card'],
          billing_address_collection: 'auto',
          shipping_options: [
            {shipping_rate: 'shr_1LOIC6HGVyweKFAEDPEqwosP'}
          ],
          line_items: req.body.map((item) => {
            const img = item.image[0].asset._ref;
            const newImage = img.replace('image-', 'https://cdn.sanity.io/images/ytcu56uk/production/')
            .replace('-webp','.webp');

            console.log('IMAGE', newImage);

            return {
              price_data: {
                currency: 'pln',
                product_data: {
                  name: item.name,
                  images: [newImage],
                },
                unit_amount: item.price * 100
              },
              adjustable_quantity: {
                enabled: true,
                minimum: 1
              },
              quantity: item.quantity
            }
          })
            // {
            //   // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            //   price_data: {
            //     currency: 'pln',
            //     unit_amount: 10,
            //     product_data: {
            //       name: 'T-shirt',
            //       description: 'Comfortable cotton t-shirt',
            //       images: ['https://example.com/t-shirt.png']
            //     },
            //   },
            //   quantity: 1,
            // },
          ,
          success_url: `${req.headers.origin}/?success=true`,
          cancel_url: `${req.headers.origin}/?canceled=true`,
        }

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);
      res.status([200]).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}