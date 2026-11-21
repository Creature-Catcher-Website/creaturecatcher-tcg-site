/* Shared behavior: header, footer, cart, accounts, forms. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const unit = p => (p.sale != null ? p.sale : p.price);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- cart ---------- */
const Cart = {
  items() { return store.get('cc_cart', []); },
  save(i) { store.set('cc_cart', i); Cart.render(); },
  add(id) {
    const p = PRODUCTS.find(x => x.id === id); if (!p || !p.inStock) return;
    const i = Cart.items(); const l = i.find(x => x.id === id);
    l ? l.qty++ : i.push({ id, qty: 1 });
    Cart.save(i); toast(p.name + ' added to cart');
  },
  setQty(id, q) { Cart.save(Cart.items().map(x => x.id === id ? { ...x, qty: q } : x).filter(x => x.qty > 0)); },
  remove(id) { Cart.save(Cart.items().filter(x => x.id !== id)); },
  clear() { Cart.save([]); },
  lines() { return Cart.items().map(l => ({ ...l, p: PRODUCTS.find(x => x.id === l.id) })).filter(l => l.p); },
  total() { return Cart.lines().reduce((s, l) => s + unit(l.p) * l.qty, 0); },
  count() { return Cart.lines().reduce((s, l) => s + l.qty, 0); },
  render() {
    $$('.cart-count').forEach(e => e.textContent = Cart.count());
    const box = $('#drawer-items'); if (!box) return;
    const lines = Cart.lines();
    box.innerHTML = lines.length ? lines.map(l => `
      <div class="line-item">
        <div><strong>${esc(l.p.name)}</strong>
          <div class="qty"><button aria-label="Remove one" data-q="${l.id}" data-d="-1">−</button><span>${l.qty}</span><button aria-label="Add one" data-q="${l.id}" data-d="1">+</button></div></div>
        <div style="text-align:right"><div>${money(unit(l.p) * l.qty)}</div><button class="link-btn" data-rm="${l.id}">Remove</button></div>
      </div>`).join('') : '<p class="empty">Your cart is empty. Add a pack from the shop.</p>';
    $('#drawer-total').textContent = money(Cart.total());
    $('#drawer-checkout').toggleAttribute('disabled', !lines.length);
  }
};

/* ---------- shipping (US only, by weight) ---------- */
const Shipping = {
  weightOz() { return Cart.lines().reduce((t, l) => t + (l.p.weightOz || 0) * l.qty, 0) + CONFIG.shipping.packagingOz; },
  quote() {
    if (!Cart.count()) return { oz: 0, price: 0 };
    const oz = Shipping.weightOz(), tier = CONFIG.shipping.rates.find(r => oz <= r.upToOz);
    return tier ? { oz, price: tier.price } : null;   // null = too heavy for the rate table
  }
};

/* ---------- accounts (Firebase Auth + Firestore) ---------- */
const FB = {
  enabled() { return !!(CONFIG.firebase && CONFIG.firebase.apiKey); },
  init() {
    if (!FB.enabled()) return Promise.resolve(null);
    if (!FB._p) FB._p = (async () => {
      const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
      const [app, auth, fs] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
      const a = app.initializeApp(CONFIG.firebase);
      return { auth, fs, a: auth.getAuth(a), db: fs.getFirestore(a) };
    })();
    return FB._p;
  }
};
const AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists. Log in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Use a password with at least 8 characters.',
  'auth/invalid-credential': 'Email or password is incorrect. Check both and try again.',
  'auth/wrong-password': 'Email or password is incorrect. Check both and try again.',
  'auth/user-not-found': 'Email or password is incorrect. Check both and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.'
};
const Auth = {
  enabled: () => FB.enabled(),
  current() { return store.get('cc_user', null); },      // cached so the header can render instantly
  async ready() { const f = await FB.init(); if (!f) return null; await f.a.authStateReady(); return f.a.currentUser; },
  async run(fn) { try { return await fn(); } catch (e) { throw new Error(AUTH_ERRORS[e.code] || 'Something went wrong. Try again in a moment.'); } },
  signup(name, email, pw) {
    return Auth.run(async () => {
      if (pw.length < 8) throw { code: 'auth/weak-password' };
      const f = await FB.init(); const c = await f.auth.createUserWithEmailAndPassword(f.a, email.trim(), pw);
      await f.auth.updateProfile(c.user, { displayName: name.trim() });
      store.set('cc_user', { uid: c.user.uid, name: name.trim(), email: c.user.email });
    });
  },
  login(email, pw) {
    return Auth.run(async () => { const f = await FB.init(); await f.auth.signInWithEmailAndPassword(f.a, email.trim(), pw); });
  },
  resetPassword(email) { return Auth.run(async () => { const f = await FB.init(); await f.auth.sendPasswordResetEmail(f.a, email.trim()); }); },
  async logout() { const f = await FB.init(); if (f) await f.auth.signOut(f.a); localStorage.removeItem('cc_user'); }
};
// Keep the cached name in sync with the real sign-in state, and update the header link.
function watchAuth() {
  FB.init().then(f => f && f.auth.onAuthStateChanged(f.a, u => {
    u ? store.set('cc_user', { uid: u.uid, name: u.displayName || u.email.split('@')[0], email: u.email }) : localStorage.removeItem('cc_user');
    const link = $('#acct-link'); const s = Auth.current(); if (link) link.textContent = s ? s.name.split(' ')[0] : 'Log in';
  })).catch(() => {});
}
/* Order history lives in Firestore under users/{uid}/orders. PayPal remains the source of truth for payments. */
const Orders = {
  async save(o) {
    try {
      const f = await FB.init(), u = f && f.a.currentUser; if (!u) return;
      await f.fs.addDoc(f.fs.collection(f.db, 'users', u.uid, 'orders'), { ...o, createdAt: f.fs.serverTimestamp() });
    } catch (e) { /* never block the confirmation screen */ }
  },
  async list() {
    const f = await FB.init(), u = f && f.a.currentUser; if (!u) return [];
    const q = f.fs.query(f.fs.collection(f.db, 'users', u.uid, 'orders'), f.fs.orderBy('createdAt', 'desc'));
    return (await f.fs.getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

/* ---------- layout ---------- */
const NAV = [['index.html', 'Home'], ['index.html#about', 'About'], ['index.html#services', 'Services'], ['gallery.html', 'Gallery'],
  { label: 'Booklet', href: 'booklet.html', sub: [['booklet.html', '2026 booklet']] },
  ['blog.html', 'Blog'], ['shop.html', 'Shop'], ['notifications.html', 'Notifications'], ['index.html#contact', 'Contact']];
const social = () => [['YouTube', CONFIG.youtube], ['Instagram', CONFIG.instagram]].filter(x => x[1]).map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join(' · ');

function buildLayout() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const s = Auth.current();
  const links = NAV.map(n => Array.isArray(n)
    ? `<a href="${n[0]}"${n[0] === page ? ' aria-current="page"' : ''}>${n[1]}</a>`
    : `<div class="has-sub"><a href="${n.href}"${page === n.href ? ' aria-current="page"' : ''}>${n.label}</a><button type="button" class="sub-toggle" aria-expanded="false" aria-label="${n.label} menu">&#9662;</button>
        <ul class="sub">${n.sub.map(([h, t]) => `<li><a href="${h}"${h === page ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></div>`).join('');
  $('#site-header').outerHTML = `
  <header class="site-header"><div class="wrap">
    <a class="brand" href="index.html"><img src="${IMG.logo}" alt="" width="44" height="44">${CONFIG.name}</a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Main">${links}
      <a id="acct-link" href="login.html"${page === 'login.html' ? ' aria-current="page"' : ''}>${s ? esc(s.name.split(' ')[0]) : 'Log in'}</a>
      <button class="cart-btn" id="open-cart">Cart<span class="cart-count">0</span></button>
    </nav></div></header>`;
  $('#site-footer').outerHTML = `
  <footer class="site-footer"><div class="wrap">
    <div class="foot-grid">
      <div><h3>${CONFIG.name}</h3><p>Trading cards for collectors, traders and anyone who wants to catch them all.</p></div>
      <div><h3>Explore</h3><ul><li><a href="shop.html">Shop</a></li><li><a href="blog.html">Blog</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="index.html#services">Services</a></li><li><a href="index.html#contact">Contact</a></li></ul></div>
      <div><h3>Newsletter</h3><p>Get new releases and restocks.</p>
        <form class="news" id="news-form"><label class="sr" for="news-email" style="position:absolute;left:-9999px">Email address</label><input id="news-email" type="email" placeholder="you@email.com" required><button class="btn" type="submit">Subscribe</button></form>
        <p style="margin-top:10px">${social()}</p></div>
    </div>
    <p class="copy">© ${new Date().getFullYear()} ${CONFIG.name}. All rights reserved.</p>
  </div></footer>
  <div class="drawer-bg" id="drawer-bg"></div>
  <aside class="drawer" id="drawer" aria-label="Shopping cart" aria-hidden="true">
    <header><h3 style="margin:0">Your cart</h3><button class="link-btn" id="close-cart">Close</button></header>
    <div class="items" id="drawer-items"></div>
    <footer><div class="subtotal"><span>Subtotal</span><span id="drawer-total">$0.00</span></div>
      <a class="btn dark" id="drawer-checkout" href="checkout.html" style="display:block;text-align:center">Go to checkout</a></footer>
  </aside>`;

  const sb = $('.sub-toggle');
  sb.onclick = () => { const o = sb.parentElement.classList.toggle('open'); sb.setAttribute('aria-expanded', o); };
  document.addEventListener('click', e => { if (!e.target.closest('.has-sub')) { sb.parentElement.classList.remove('open'); sb.setAttribute('aria-expanded', 'false'); } });
  const toggle = $('.menu-toggle');
  toggle.onclick = () => { const o = $('#nav').classList.toggle('open'); toggle.setAttribute('aria-expanded', o); };
  const d = $('#drawer'), bg = $('#drawer-bg');
  const open = v => { d.classList.toggle('open', v); bg.classList.toggle('open', v); d.setAttribute('aria-hidden', !v); };
  $('#open-cart').onclick = () => open(true); $('#close-cart').onclick = () => open(false); bg.onclick = () => open(false);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  d.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const l = Cart.items().find(x => x.id === q.dataset.q); Cart.setQty(q.dataset.q, l.qty + +q.dataset.d); }
    if (r) Cart.remove(r.dataset.rm);
  });
  $('#news-form').onsubmit = e => {
    e.preventDefault();
    const em = $('#news-email').value.trim(); const list = store.get('cc_news', []);
    if (!list.includes(em)) list.push(em); store.set('cc_news', list);
    // To collect real signups, post `em` to your email service (Mailchimp, Buttondown, etc.) here.
    e.target.reset(); toast('Subscribed. Watch your inbox for new releases.');
  };
  Cart.render();
  watchAuth();
}

/* ---------- shared components ---------- */
function productCard(p) {
  const thumb = p.image ? `<img src="${p.image}" alt="${esc(p.name)}">` : `<div class="card-ph">${esc(p.name)}</div>`;
  const tag = !p.inStock ? '<span class="tag out">Sold out</span>' : (p.sale != null ? '<span class="tag">Sale</span>' : '');
  const price = p.sale != null ? `<span class="now">${money(p.sale)}</span><s>${money(p.price)}</s>` : money(p.price);
  return `<article class="product"><div class="thumb">${thumb}${tag}</div><div class="body">
    <h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="price">${price}</div>
    <button class="btn" data-add="${p.id}" ${p.inStock ? '' : 'disabled'}>${p.inStock ? 'Add to cart' : 'Sold out'}</button></div></article>`;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b) Cart.add(b.dataset.add); });

document.addEventListener('DOMContentLoaded', buildLayout);
