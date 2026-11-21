/* ===== Edit this file to change site content ===== */
const CONFIG = {
  name: 'Creature Catcher',
  email: 'Gimkids951@gmail.com',
  phone: '',                       // add your phone number
  address: '',                     // add your city/state if you want it shown
  youtube: 'https://www.youtube.com/@CreatureCatcher-dl',
  instagram: '',                   // paste your Instagram URL here and the link appears automatically
  founded: 'December 4th, 2025',
  paypalClientId: 'YOUR_PAYPAL_CLIENT_ID', // from developer.paypal.com > Apps & Credentials
  currency: 'USD',

  // Accounts: create a free Firebase project (console.firebase.google.com), turn on Authentication > Email/Password
  // and Firestore, then paste the web app config here. Leave apiKey empty and accounts stay switched off.
  firebase: { apiKey: '', authDomain: '', projectId: '', appId: '' },

  // Shipping (US only), priced by total package weight in ounces (products + packaging).
  // Rates are USPS RETAIL prices from Price List Notice 123 (effective Oct 4, 2026), Ground Advantage Zone 5,
  // and First-Class Mail Flats for small orders. Ground Advantage prices include USPS temporary holiday pricing,
  // which ends Jan 17, 2027: re-check usps.com (Notice 123) after that date.
  // Small orders (up to 5 oz) assume a flexible padded envelope no thicker than 3/4 inch (First-Class Mail Flat).
  shipping: {
    country: 'US',
    packagingOz: 2,                 // padded mailer / carton and tape added to every order. Weigh yours and adjust.
    rates: [                        // the first row whose upToOz covers the package weight is used
      { upToOz: 1,   price: 1.69 }, { upToOz: 2,   price: 1.98 }, { upToOz: 3,   price: 2.27 },
      { upToOz: 4,   price: 2.56 }, { upToOz: 5,   price: 2.85 },
      { upToOz: 8,   price: 9.35 },   // Ground Advantage 8 oz
      { upToOz: 16,  price: 11.70 },  // up to 1 lb
      { upToOz: 32,  price: 14.85 },  // 2 lb
      { upToOz: 48,  price: 15.70 },  // 3 lb
      { upToOz: 64,  price: 17.80 },  // 4 lb
      { upToOz: 80,  price: 18.85 },  // 5 lb
      { upToOz: 96,  price: 19.80 },  // 6 lb
      { upToOz: 112, price: 20.85 },  // 7 lb
      { upToOz: 128, price: 21.80 },  // 8 lb
      { upToOz: 144, price: 22.80 },  // 9 lb
      { upToOz: 160, price: 24.25 }   // 10 lb
    ]
  }
};

const IMG = {
  logo: 'images/logo.png'
};

const PRODUCTS = [
  { id: 'first-edition-booster-box', name: 'First Edition Booster Box', price: 124.99, sale: 99.99, inStock: false, weightOz: 18.75, // 25 packs x 0.75 oz
   
    desc: 'A sealed box of First Edition booster packs. Currently sold out; join the newsletter to hear about restocks.', image: '' },
  { id: '1st-edition-pack', name: '1st Edition Pack', price: 4.99, sale: 3.99, inStock: true, weightOz: 0.75, // about 21 g, like a Pokémon pack
   
    desc: 'One First Edition booster pack. Open it and see which creatures you catch.', image: '' }
];


const POSTS = [
  { id: 'card-reveal', title: 'Card Reveal', date: 'Aug 2', author: 'Liam 2', read: '1 min read', cover: 'images/cards/83-blossom.webp',
    body: 'We revealed the first Creature Catcher cards on our YouTube channel. Watch the reveal and tell us which creature is your favorite.' }
];

// Sample announcements. Replace with your own.
const NOTIFICATIONS = [
  { id: 'n1', title: 'Welcome to Creature Catcher', text: 'Our new website is live. Browse the shop and join the community.', date: 'Nov 18, 2026' },
  { id: 'n2', title: 'The full 1st Edition gallery is up', text: 'Every card in the set is now in the gallery. Filter by element or search by name.', date: 'Nov 18, 2026' },
  { id: 'n3', title: 'First Edition Booster Box is sold out', text: 'We will announce the restock in the newsletter first.', date: 'Nov 18, 2026' }
];

// Every card in the 1st Edition set: [id, name, element, type, set number (of 82), stage, rarity]
// rarity: C common, U uncommon, R rare, SR super rare, SP special, SSP super special. Images: images/cards/<id>.webp (thumb), images/full/<id>.webp (large)
const ELEMENTS = [['bio','Bio'],['pyro','Pyro'],['hydro','Hydro'],['magneto','Magneto'],['geo','Geo'],['cryo','Cryo'],['techno','Techno'],['astro','Astro'],['shadow','Shadow'],['aero','Aero']];
const CARDS = [["aero-element","Aero element","aero","element",0,"",""],["astro-element","Astro element","astro","element",0,"",""],["bio-element","Bio element","bio","element",0,"",""],["cryo-element","Cryo element","cryo","element",0,"",""],["geo-element","Geo element","geo","element",0,"",""],["hydro-element","Hydro element","hydro","element",0,"",""],["magneto-element","Magneto element","magneto","element",0,"",""],["pyro-element","Pyro element","pyro","element",0,"",""],["shadow-element","Shadow element","shadow","element",0,"",""],["techno-element","Techno element","techno","element",0,"",""],["01-blossom","Blossom","bio","creature",1,"1","C"],["02-bliouer","Bliouer","bio","creature",2,"2","U"],["03-bloraine","Bloraine","bio","creature",3,"3","R"],["04-bloraine","Bloraine","bio","creature",4,"X","SR"],["05-caterfly","Caterfly","bio","creature",5,"1","C"],["06-crystalline","Crystalline","bio","creature",6,"2","C"],["07-crystawing","Crystawing","bio","creature",7,"3","U"],["08-floupup","Floupup","bio","creature",8,"1","C"],["09-barkbloom","Barkbloom","bio","creature",9,"2","U"],["10-barkbloom","Barkbloom","bio","creature",10,"X","SR"],["11-fruitic","Fruitic","bio","creature",11,"1","C"],["12-sapafruit","Sapafruit","bio","creature",12,"2","U"],["13-pyrie","Pyrie","pyro","creature",13,"1","C"],["14-pyrot","Pyrot","pyro","creature",14,"2","U"],["15-pyrite","Pyrite","pyro","creature",15,"3","R"],["16-pyrite","Pyrite","pyro","creature",16,"X","SR"],["17-duopup","Duopup","pyro","creature",17,"1","C"],["18-trihound","Trihound","pyro","creature",18,"2","U"],["19-trihound","Trihound","pyro","creature",19,"X","SR"],["20-pheony","Pheony","pyro","creature",20,"1","U"],["21-tetpyro","Tetpyro","pyro","creature",21,"2","R"],["22-aquare","Aquare","hydro","creature",22,"1","C"],["23-aquae","Aquae","hydro","creature",23,"2","U"],["24-aquari","Aquari","hydro","creature",24,"3","R"],["25-aquari","Aquari","hydro","creature",25,"X","SR"],["26-magentaphoen","Magentaphoen","hydro","creature",26,"1","C"],["27-flamboyantic","Flamboyantic","hydro","creature",27,"1","U"],["28-flamboyantic","Flamboyantic","hydro","creature",28,"X","SR"],["29-tethydro","Tethydro","hydro","creature",29,"2","R"],["30-shellby","Shellby","hydro","creature",30,"1","C"],["31-shellot","Shellot","hydro","creature",31,"2","U"],["32-shellastrot","Shellastrot","hydro","creature",32,"3","U"],["33-octi","Octi","hydro","creature",33,"1","C"],["34-octrum","Octrum","hydro","creature",34,"1","U"],["35-kraktrum","Kraktrum","hydro","creature",35,"3","R"],["36-kraktrum","Kraktrum","hydro","creature",36,"X","SR"],["37-kitspark","Kitspark","magneto","creature",37,"1","C"],["38-catshock","Catshock","magneto","creature",38,"2","U"],["39-melichtser","Melichtser","magneto","creature",39,"3","R"],["40-melichtser","Melichtser","magneto","creature",40,"X","SR"],["41-elepooch","Elepooch","magneto","creature",41,"1","C"],["42-sparkpup","Sparkpup","magneto","creature",42,"2","U"],["43-lightnine","Lightnine","magneto","creature",43,"3","R"],["44-lightnine","Lightnine","magneto","creature",44,"X","SR"],["45-tetagneto","Tetagneto","magneto","creature",45,"2","R"],["46-elebunny","Elebunny","magneto","creature",46,"1","C"],["47-catfight","Catfight","geo","creature",47,"1","U"],["48-emralphox","Emralphox","geo","creature",48,"1","U"],["49-pebbledip","Pebbledip","geo","creature",49,"1","C"],["50-goldorg","Goldorg","techno","creature",50,"1","C"],["51-warrigold","Warrigold","techno","creature",51,"2","U"],["52-astra","Astra","astro","creature",52,"1","C"],["53-astrolia","Astrolia","astro","creature",53,"2","U"],["54-tellastar","Tellastar","astro","creature",54,"3","R"],["55-tellastar","Tellastar","astro","creature",55,"X","SR"],["56-cospot","Cospot","astro","creature",56,"1","R"],["57-astrat","Astrat","astro","creature",57,"1","R"],["58-shadowkit","Shadowkit","shadow","creature",58,"1","C"],["59-metiphox","Metiphox","shadow","creature",59,"2","U"],["60-moonsune","Moonsune","shadow","creature",60,"3","R"],["61-moonsune","Moonsune","shadow","creature",61,"X","SR"],["62-cospot","Cospot","shadow","creature",62,"1","R"],["63-shadrot","Shadrot","shadow","creature",63,"1","R"],["64-airsie","Airsie","aero","creature",64,"1","C"],["65-aerolite","Aerolite","aero","creature",65,"2","U"],["66-aerolis","Aerolis","aero","creature",66,"3","R"],["67-aerolis","Aerolis","aero","creature",67,"X","SR"],["68-tetro","Tetro","aero","creature",68,"1","C"],["69-bunnit","Bunnit","aero","creature",69,"1","C"],["70-alpunny","Alpunny","aero","creature",70,"2","U"],["71-kangajoey","Kangajoey","aero","creature",71,"1","C"],["72-kangatron","Kangatron","aero","creature",72,"2","U"],["73-chimpyglee","Chimpyglee","aero","creature",73,"1","C"],["74-monkaiai","Monkaiai","aero","creature",74,"2","U"],["75-piglite","Piglite","aero","creature",75,"1","C"],["76-overhog","Overhog","aero","creature",76,"2","U"],["77-x-elemental","X Elemental","charm","charm",77,"","U"],["78-apple","Apple","charm","charm",78,"","C"],["79-cospots-masks","Cospot's Masks","charm","charm",79,"","R"],["80-health-boost","Health Boost","charm","charm",80,"","R"],["81-med-pack","Med Pack","charm","charm",81,"","C"],["82-rare-candy","Rare Candy","charm","charm",82,"","C"],["83-blossom","Blossom","bio","creature",83,"1","SP"],["84-floupup","Floupup","bio","creature",84,"1","SP"],["85-sapafruit","Sapafruit","bio","creature",85,"2","SP"],["86-pyrie","Pyrie","pyro","creature",86,"1","SP"],["87-aquare","Aquare","hydro","creature",87,"1","SP"],["88-kitspark","Kitspark","magneto","creature",88,"1","SP"],["89-astra","Astra","astro","creature",89,"1","SP"],["90-shadowkit","Shadowkit","shadow","creature",90,"1","SP"],["91-bloraine","Bloraine","bio","creature",91,"X","SSP"],["92-aquari","Aquari","hydro","creature",92,"X","SSP"],["93-melichtser","Melichtser","magneto","creature",93,"X","SSP"],["94-astrat","Astrat","astro","creature",94,"1","SSP"],["95-shadrot","Shadrot","shadow","creature",95,"1","SSP"],["96-cospot","Cospot","shadow","creature",96,"1","SSP"]].map(a => ({ id: a[0], name: a[1], el: a[2], type: a[3], n: a[4], stage: a[5], rarity: a[6] }));
