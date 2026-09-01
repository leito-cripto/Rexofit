/**
 * COMPONENTE HEADER REUTILIZABLE
 * Crea y renderiza el encabezado de navegación en todas las páginas
 */

class Header {
    constructor() {
        this.containerSelector = 'header.navbar-container';
    }

    /**
     * Renderizar el header en la página
     * @param {String} paginaActiva - Nombre de la página actual ('home', 'buzos', 'polos', 'revendedores', 'empresas')
     */
    render(paginaActiva = 'home') {
        const headerElement = document.querySelector(this.containerSelector);
        if (!headerElement) {
            console.error('No se encontró elemento con clase navbar-container');
            return;
        }
        
        // Determinar qué enlace debe estar activo
        const isActive = (page) => paginaActiva === page ? ' active' : '';
        
        headerElement.innerHTML = `
            <div class="site-header">
                <div class="header-inner">
                    <a href="index.html" class="brand">
                        <img src="/img/logo-blanco.jpeg" class="brand-logo"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                        <span style="display:none; font-size:22px; font-weight:700; color:#111;">Rexofit</span>
                    </a>
                    <nav class="nav-links">
                        <a href="index.html" class="nav-link${isActive('home')}">INICIO</a>
                        <a href="#" class="nav-link${(paginaActiva === 'buzos' || paginaActiva === 'polos' || paginaActiva === 'zapatos-mujer') ? ' active' : ''}" id="btnTienda">TIENDA</a>
                        <a href="revendedores.html" class="nav-link${isActive('revendedores')}">REVENDEDORES</a>
                        <a href="empresas.html" class="nav-link${isActive('empresas')}">EMPRESAS</a>
                    </nav>
                    <a href="carrito.html" class="cart-link" aria-label="Carrito">
                        <svg class="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span class="cart-count" id="cartCount">0</span>
                    </a>
                </div>
            </div>
        `;
        // Actualizar el badge del carrito
        this.actualizarBadgeCarrito();
        // Escuchar cambios en el carrito
        this.escucharCambiosCarrito();
    }

    /**
     * Actualizar el número en el badge del carrito
     */
    actualizarBadgeCarrito() {
        const countEl = document.getElementById('cartCount');
        if (countEl) {
            try {
                const data = JSON.parse(localStorage.getItem('cart')) || [];
                const total = data.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0);
                countEl.textContent = total;
            } catch(e) {
                countEl.textContent = 0;
            }
        }
    }

    /**
     * Escuchar cambios en el carrito y actualizar badge
     */
    escucharCambiosCarrito() {
        // Escuchar eventos de storage para cambios en otras pestañas
        window.addEventListener('storage', () => {
            this.actualizarBadgeCarrito();
            if (typeof renderMiniCart === 'function') renderMiniCart();
        });
        
        // También escuchar eventos de localStorage en la misma página
        window.addEventListener('cartUpdated', () => {
            this.actualizarBadgeCarrito();
            if (typeof renderMiniCart === 'function') renderMiniCart();
        });
    }
}

// Crear instancia global del header
const header = new Header();

// ==========================================
// CATEGORIES MODAL - setup (called after header.render)
// ==========================================
function setupCategoriesModal() {
    const btnTienda = document.getElementById("btnTienda") || document.getElementById("categoriasLink");
    const modal = document.getElementById("categoriesModal");
    const close = document.getElementById("closeCategories") || document.getElementById("categoriesClose");
    const backdrop = document.getElementById("categoriesBackdrop");

    if (!modal) return;

    function openModal() {
        modal.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    if (btnTienda) {
        btnTienda.addEventListener("click", function(e) {
            e.preventDefault();
            openModal();
        });
    }

    if (close) close.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });
}

// ==========================================
// TOAST NOTIFICATION SYSTEM (Steam-like)
// ==========================================

function showToast(message, subtitle = '') {
    // Remove existing toast if any
    const existingToast = document.getElementById('cartToast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    toast.innerHTML = `
        <div class="cart-toast__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <div class="cart-toast__content">
            <div class="cart-toast__message">${message}</div>
            ${subtitle ? `<div class="cart-toast__subtitle">${subtitle}</div>` : ''}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('cart-toast--show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('cart-toast--show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Dispatch cart update event
function dispatchCartUpdate() {
    window.dispatchEvent(new Event('cartUpdated'));
}

// ==========================================
// WHATSAPP HELP FLOATING BUTTON (GLOBAL)
// ==========================================

const WHATSAPP_HELP_DEFAULTS = {
  phone: '51929896007',
  message: 'Hola, necesito ayuda con un producto.',
  label: 'Ayuda Por WhatsApp'
};

function buildWhatsAppHelpLink({ phone, message }) {
  const numero = String(phone || '').trim();
  const texto = encodeURIComponent(String(message || '').trim());
  // Official wa.me format
  return `https://wa.me/${numero}?text=${texto}`;
}

function injectWhatsAppHelpButton(options = {}) {
  // Avoid duplicates if multiple scripts/pages attempt to inject
  if (document.getElementById('waHelpFab')) return;

  const phone = options.phone || WHATSAPP_HELP_DEFAULTS.phone;
  const message = options.message || WHATSAPP_HELP_DEFAULTS.message;
  const label = options.label || WHATSAPP_HELP_DEFAULTS.label;

  if (!phone) return;

  const link = buildWhatsAppHelpLink({ phone, message });
  const a = document.createElement('a');
  a.id = 'waHelpFab';
  a.className = 'wa-help-fab';
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', 'WhatsApp help');
  a.title = 'WhatsApp help';
  a.innerHTML = `
    <span class="wa-help-fab__icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="18" height="18" focusable="false" aria-hidden="true">
        <path fill="currentColor" d="M19.11 17.47c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.14-1.13-.41-2.15-1.32-.79-.7-1.33-1.57-1.49-1.84-.16-.27-.02-.42.12-.56.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.61-1.47-.84-2.02-.22-.53-.44-.46-.61-.47l-.52-.01c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.64 1.11 2.82.14.18 1.91 2.92 4.62 4.09.65.28 1.16.45 1.55.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/>
        <path fill="currentColor" d="M16.02 5.33c-5.9 0-10.69 4.79-10.69 10.69 0 1.86.48 3.68 1.39 5.3L5.1 26.67l5.52-1.58c1.55.85 3.29 1.3 5.4 1.3 5.9 0 10.69-4.79 10.69-10.69S21.92 5.33 16.02 5.33zm0 19.26c-1.87 0-3.45-.5-4.92-1.36l-.35-.2-3.27.94.96-3.19-.22-.38c-.88-1.51-1.34-3.07-1.34-4.83 0-4.87 3.96-8.83 8.83-8.83 4.87 0 8.83 3.96 8.83 8.83 0 4.87-3.96 8.83-8.83 8.83z"/>
      </svg>
    </span>
    <span class="wa-help-fab__label">${String(label)}</span>
  `;

  document.body.appendChild(a);
}

function actualizarContadorCarrito() {
  try {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    const total = data.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0);
    const el = document.getElementById("cartCount");
    if (el) el.textContent = total;
  } catch(e) {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = 0;
  }
}

// ==========================================
// MINI CART DRAWER
// ==========================================

function renderMiniCart() {
  const drawer = document.getElementById('miniCartDrawer');
  const itemsContainer = document.getElementById('miniCartItems');
  const totalEl = document.getElementById('miniCartTotal');
  const subtotalEl = document.getElementById('miniCartSubtotal');
  const badgeEl = document.getElementById('miniCartBadge');

  if (!drawer || !itemsContainer) return;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (typeof window.recalcularPreciosPolosCarrito === 'function') {
    cart = window.recalcularPreciosPolosCarrito(cart);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Update badge count
  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.qty) || 0), 0);
  if (badgeEl) badgeEl.textContent = totalItems;

  // Update total
  const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * (parseInt(item.qty) || 1), 0);
  if (totalEl) totalEl.textContent = 'S/ ' + totalPrice.toFixed(2);
  if (subtotalEl) subtotalEl.textContent = 'S/ ' + totalPrice.toFixed(2);

  // Empty state
  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="mini-cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Tu carrito está vacío</span>
      </div>`;
    return;
  }

  itemsContainer.innerHTML = cart.map(item => {
    const qty = parseInt(item.qty) || 1;
    const unitPrice = parseFloat(item.price) || 0;
    const subtotal = (unitPrice * qty).toFixed(2);
    const imgSrc = item.image ? item.image.replace('../', '/') : '';
    const colorDot = item.colorHex
      ? `<span class="mini-cart-item__color-dot" style="background:${item.colorHex}"></span>`
      : '';
    const details = [
      colorDot + (item.color || ''),
      item.size ? `Talla: ${item.size}` : ''
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');

    return `
      <div class="mini-cart-item">
        <div class="mini-cart-item__img">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${item.name || 'Producto'}" loading="lazy">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:22px;">🛍</div>`
          }
        </div>
        <div class="mini-cart-item__info">
          <div class="mini-cart-item__name">${item.name || 'Producto'}</div>
          <div class="mini-cart-item__details">${details}</div>
          <div class="mini-cart-item__bottom">
            <span class="mini-cart-item__qty">× ${qty}</span>
            <span class="mini-cart-item__price">S/ ${subtotal}</span>
          </div>
        </div>
        <button class="mini-cart-item__remove" data-id="${item.id}" title="Eliminar producto" aria-label="Eliminar">×</button>
      </div>`;
  }).join('');
}

function openMiniCart() {
  const drawer = document.getElementById('miniCartDrawer');
  const overlay = document.getElementById('miniCartOverlay');
  if (drawer) drawer.classList.add('mini-cart-open');
  if (overlay) overlay.classList.add('mini-cart-overlay-open');
  renderMiniCart();
}

function closeMiniCart() {
  const drawer = document.getElementById('miniCartDrawer');
  const overlay = document.getElementById('miniCartOverlay');
  if (drawer) drawer.classList.remove('mini-cart-open');
  if (overlay) overlay.classList.remove('mini-cart-overlay-open');
}

function injectMiniCartDrawer() {
  if (document.getElementById('miniCartDrawer')) return;

  const drawer = document.createElement('div');
  drawer.id = 'miniCartDrawer';
  drawer.className = 'mini-cart-drawer';
  drawer.innerHTML = `
    <div class="mini-cart-header">
      <div class="mini-cart-header-left">
        <h3>Mi Carrito</h3>
        <span class="mini-cart-badge" id="miniCartBadge">0</span>
      </div>
      <button class="mini-cart-close" onclick="closeMiniCart()" aria-label="Cerrar carrito">&times;</button>
    </div>
    <div class="mini-cart-items" id="miniCartItems"></div>
    <div class="mini-cart-footer">
      <div class="mini-cart-subtotal-row">
        <span>Subtotal</span>
        <span id="miniCartSubtotal">S/ 0.00</span>
      </div>
      <div class="mini-cart-total">
        <span>Total</span>
        <strong id="miniCartTotal">S/ 0.00</strong>
      </div>
      <a href="carrito.html" class="mini-cart-checkout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a7.83 7.83 0 01-3.992-1.093l-.287-.17-2.975.78.793-2.9-.187-.298A7.863 7.863 0 014.2 11.93c0-4.328 3.52-7.848 7.849-7.848a7.794 7.794 0 015.548 2.299 7.794 7.794 0 012.3 5.55c-.002 4.327-3.522 7.848-7.868 7.948z"/>
        </svg>
        Completar pedido por WhatsApp
      </a>
    </div>
  `;
  document.body.appendChild(drawer);

  const overlay = document.createElement('div');
  overlay.id = 'miniCartOverlay';
  overlay.className = 'mini-cart-overlay';
  overlay.onclick = closeMiniCart;
  document.body.appendChild(overlay);

  // Open mini cart drawer when clicking cart icon (except on carrito page)
  document.addEventListener('click', function(e) {
    const cartLink = e.target.closest('.cart-link');
    if (!cartLink) return;
    // On carrito.html, navigate normally
    const path = window.location.pathname;
    const isCarritoPage = path.includes('carrito') || document.body.dataset.pagina === 'carrito';
    if (isCarritoPage) return;
    e.preventDefault();
    openMiniCart();
  });

  // Listener para botón X — confirmar antes de eliminar
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.mini-cart-item__remove');
    if (!btn) return;
    const itemId = btn.dataset.id;
    if (!itemId) return;

    // Crear modal de confirmación
    const existing = document.getElementById('_miniCartConfirm');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = '_miniCartConfirm';
    modal.className = 'mini-cart-confirm-overlay';
    modal.innerHTML = `
      <div class="mini-cart-confirm">
        <p class="mini-cart-confirm__msg">¿Quieres eliminar este producto del carrito?</p>
        <div class="mini-cart-confirm__actions">
          <button class="mini-cart-confirm__cancel">Cancelar</button>
          <button class="mini-cart-confirm__ok">Sí, eliminar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector('.mini-cart-confirm__cancel').onclick = function() {
      modal.remove();
    };
    modal.querySelector('.mini-cart-confirm__ok').onclick = function() {
      modal.remove();
      // Eliminar del localStorage
      try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(function(p) { return p.id !== itemId; });
        if (typeof window.recalcularPreciosPolosCarrito === 'function') {
          cart = window.recalcularPreciosPolosCarrito(cart);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderMiniCart();
        actualizarContadorCarrito();
        window.dispatchEvent(new Event('cartUpdated'));
      } catch(err) {}
    };

    // Cerrar al click fuera
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Auto-render the header based on the current page
  const page = document.body.dataset.pagina || 'home';
  
  if (document.querySelector('header.navbar-container')) {
    header.render(page);
  }

  // Setup modal AFTER header.render() so btnTienda exists in the DOM
  setupCategoriesModal();
  
  actualizarContadorCarrito();

  // Optional global override (set in any page before header.js loads)
  // window.WHATSAPP_HELP_CONFIG = { phone: '51929896007', message: '...', label: 'Help' }
  const globalCfg = (typeof window !== 'undefined' && window.WHATSAPP_HELP_CONFIG)
    ? window.WHATSAPP_HELP_CONFIG
    : {};

  injectWhatsAppHelpButton(globalCfg);
  
  // Inject mini cart drawer
  injectMiniCartDrawer();

  // ── POPUP MES MORADO ──────────────────────────────
  setTimeout(function() { injectSemanaSantaPopup(); }, 800);
});

function injectSemanaSantaPopup() {
  if (document.getElementById('_ssPopup')) return;

  // Mostrar 1 vez por sesión, luego esperar 1 hora antes de volver a aparecer
  var POPUP_KEY = 'rexofit_mes_morado_shown';
  var UNA_HORA  = 5 * 60 * 1000;
  var lastShown = parseInt(localStorage.getItem(POPUP_KEY) || '0', 10);
  if (Date.now() - lastShown < UNA_HORA) return;
  localStorage.setItem(POPUP_KEY, String(Date.now()));

  var overlay = document.createElement('div');
  overlay.id = '_ssPopup';
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:999999',
    'display:flex','align-items:center','justify-content:center',
    'background:rgba(18,7,23,0.72)','padding:20px',
    'animation:_ssFadeIn .35s ease'
  ].join(';');

  overlay.innerHTML = `
    <style>
      @keyframes _ssFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes _ssSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
      #_ssCard {
        background:linear-gradient(145deg,#fff 0%,#f7f1ff 100%);
        border:1px solid rgba(245,197,66,.55);
        border-radius:20px; max-width:430px; width:100%;
        text-align:center; padding:42px 32px 32px; position:relative;
        box-shadow:0 24px 70px rgba(33,7,51,0.42), inset 0 0 0 5px rgba(109,40,217,.06);
        animation:_ssSlideUp .4s ease;
        overflow:hidden;
      }
      #_ssCard:before {
        content:"";position:absolute;inset:0;pointer-events:none;
        background:radial-gradient(circle at 12% 8%,rgba(245,197,66,.22),transparent 28%),radial-gradient(circle at 92% 12%,rgba(109,40,217,.14),transparent 30%);
      }
      #_ssCard:after {
        content:"";position:absolute;inset:0;pointer-events:none;
        background:
          radial-gradient(22px 12px at 14px 0,transparent 13px,rgba(245,197,66,.50) 14px,transparent 16px) top left/44px 15px repeat-x,
          radial-gradient(22px 12px at 14px 15px,transparent 13px,rgba(109,40,217,.24) 14px,transparent 16px) bottom left/44px 15px repeat-x;
        opacity:.95;
      }
      #_ssClose {
        position:absolute;top:14px;right:16px;background:none;border:none;
        font-size:22px;cursor:pointer;color:#6b4a78;line-height:1;z-index:1;
      }
      #_ssClose:hover{color:#111}
      ._ss-badge {
        position:relative;z-index:1;
        display:inline-block;background:#3b0764;color:#f5c542;
        font-size:11px;font-weight:700;letter-spacing:1px;
        padding:6px 13px;border-radius:20px;margin-bottom:16px;
        text-transform:uppercase;
        border:1px solid rgba(245,197,66,.55);
      }
      ._ss-title {
        position:relative;z-index:1;
        font-size:clamp(1.65rem,5vw,2.25rem);font-weight:800;color:#17051f;
        margin:0 0 8px;line-height:1.12;letter-spacing:0;
      }
      ._ss-title span { color:#6d28d9; }
      ._ss-sub {
        position:relative;z-index:1;
        font-size:0.95rem;color:#4b3b53;margin:0 0 18px;line-height:1.5;
      }
      ._ss-points {
        position:relative;z-index:1;
        display:flex;justify-content:center;gap:7px;margin:0 0 20px;
      }
      ._ss-point {
        display:flex;align-items:center;justify-content:center;gap:8px;
        min-height:32px;padding:8px 10px;border-radius:10px;
        background:rgba(59,7,100,.08);color:#2f123d;
        font-size:11px;font-weight:800;border:1px solid rgba(109,40,217,.15);
        white-space:nowrap;
      }
      ._ss-point:before {
        content:"";width:7px;height:7px;border-radius:50%;
        background:#f5c542;box-shadow:0 0 0 4px rgba(245,197,66,.18);
      }
      ._ss-btn {
        position:relative;z-index:1;
        display:inline-block;background:#3b0764;color:#fff;
        padding:14px 32px;border-radius:10px;font-size:1rem;
        font-weight:700;text-decoration:none;cursor:pointer;
        border:none;width:100%;transition:background .2s;
      }
      ._ss-btn:hover{background:#6d28d9}
      ._ss-fine {
        position:relative;z-index:1;
        font-size:11px;color:#6b4a78;margin-top:14px;
      }
    </style>
    <div id="_ssCard">
      <button id="_ssClose" aria-label="Cerrar">&times;</button>
      <div class="_ss-badge">Mes morado</div>
      <h2 class="_ss-title">Se&ntilde;or de los Milagros<br><span>edici&oacute;n especial</span></h2>
      <p class="_ss-sub">30% de descuento<br>Prendas listas para renovar tu look con estilo y confianza.</p>
      <div class="_ss-points">
        <span class="_ss-point">Seguro</span>
        <span class="_ss-point">Gratis</span>
        <span class="_ss-point">WhatsApp</span>
      </div>
      <button class="_ss-btn" id="_ssShopBtn">Descubre m&aacute;s</button>
      <p class="_ss-fine">Promoci&oacute;n especial por temporada<br>&iexcl;Aprovecha antes que se agoten!</p>
    </div>
  `;

  document.body.appendChild(overlay);

  function cerrar() {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .25s';
    setTimeout(function(){ overlay.remove(); }, 260);
  }
  document.getElementById('_ssClose').onclick = cerrar;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) cerrar(); });
  document.getElementById('_ssShopBtn').onclick = function() {
    cerrar();
    var btnTienda = document.getElementById('btnTienda') || document.getElementById('categoriasLink');
    if (btnTienda) { btnTienda.click(); } else { window.location.href = 'polos.html'; }
  };
}
