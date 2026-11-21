# Creature Catcher website

Plain HTML/CSS/JS. No build step. Open `index.html` in a browser to preview.

## Pages
Home, Gallery (all 106 cards, filter by element/type, search, full-size viewer), Booklet (2026 booklet viewer + PDF download, under Booklet in the top menu), Shop, Checkout, Blog, Notifications, Log in.

## Edit content
Everything you will change often is in `js/data.js`: contact info, YouTube/Reddit links, products, blog posts, notifications.
Cards are listed at the bottom of that file (`CARDS`). To add a card: put `<id>.webp` in `images/cards/` (420 × 588 px) and `images/full/` (750 × 1050 px), then add a row.

## Before launch checklist
1. **PayPal**: create a PayPal Business account, copy your Client ID (developer.paypal.com > Apps & Credentials) into `CONFIG.paypalClientId`. Test in Sandbox first, then use the Live ID.
2. **Logo**: now stored in `images/logo.png` (cut from your PDF), so nothing depends on Wix.
3. **Product photos**: add them through the `image` field on each product in `js/data.js`.
4. **Links/contact**: paste your Instagram URL into `CONFIG.instagram` (the link only shows once it is set); also `phone`, `address` if you want them shown.
5. **Contact form**: opens the visitor's email app. Use Formspree or Web3Forms to send directly.
6. **Newsletter**: saves emails only in the visitor's own browser. Connect Mailchimp, Buttondown or similar.
7. **Accounts (Firebase)**: accounts stay switched off until you do this.
   - Go to console.firebase.google.com, create a project, add a Web app, and copy its config into `CONFIG.firebase` in `js/data.js`.
   - Build > Authentication > Sign-in method: turn on Email/Password.
   - Build > Firestore Database: create a database, then set these Rules so each customer can only see their own orders:
     ```
     rules_version = '2';
     service cloud.firestore { match /databases/{db}/documents {
       match /users/{uid}/orders/{id} { allow read, create: if request.auth != null && request.auth.uid == uid; }
     } }
     ```
   - Authentication > Settings > Authorized domains: add your real domain once you have it.
8. **Shipping (US only, by weight)**: edit `CONFIG.shipping` and each product's `weightOz` in `js/data.js`. Pack weight is 0.75 oz (about 21 g, like a Pokémon pack) and a booster box is 25 packs (18.75 oz); shipping rates are USPS retail prices (Notice 123, effective Oct 4, 2026; Ground Advantage Zone 5, and First-Class Mail Flats up to 5 oz). Ground Advantage prices include USPS temporary holiday pricing that ends Jan 17, 2027, so RE-CHECK usps.com after that date. Weigh a real packed order and adjust `packagingOz`. Shipping shows in the order summary and is sent to PayPal; addresses outside the US are rejected at PayPal. Sales tax is not calculated by the site.
9. **Hosting + domain**: drag the folder to Netlify, Vercel or Cloudflare Pages (free for static sites), then connect your domain.
