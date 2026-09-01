// ===================================================
// MENSAJES DE ERROR — simples, sin overflow, sin modal
// ===================================================

function showInfoModal(titulo, mensaje) {
    mostrarBanner(mensaje);
}

function showConfirmModal(titulo, mensaje, btnTexto, onConfirm) {
    if (window.confirm(mensaje)) { if (onConfirm) onConfirm(); }
}

function mostrarBanner(msg) {
    var banner = document.getElementById('_carritoAlert');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = '_carritoAlert';
        banner.style.cssText = [
            'position:fixed', 'top:16px', 'left:50%',
            'transform:translateX(-50%)',
            'background:#991b1b', 'color:#fff',
            'padding:14px 24px', 'border-radius:10px',
            'font-size:14px', 'font-weight:600',
            'z-index:99999', 'max-width:90vw',
            'text-align:center', 'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
            'pointer-events:none'
        ].join(';');
        document.body.appendChild(banner);
    }
    banner.textContent = msg;
    banner.style.display = 'block';
    banner.style.opacity = '1';
    clearTimeout(banner._t);
    banner._t = setTimeout(function() {
        banner.style.display = 'none';
    }, 4000);
}

// ===================================================
// CARRITO
// ===================================================

var CART_KEY = 'cart';

function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e) { return []; }
}

function getPoloPromoPrice(qty) {
    var total = 0;
    var remaining = qty;
    while (remaining >= 3) {
        total += 99;
        remaining -= 3;
    }
    if (remaining === 2) total += 89;
    if (remaining === 1) total += 49;
    return total;
}

function recalcularPreciosPolosCarrito(cart) {
    var poloItems = cart.filter(function(item) {
        if (item.isPolo) return true;
        if (typeof item.id === 'string' && item.id.indexOf('polo-') === 0) {
            item.isPolo = true;
            return true;
        }
        return false;
    });

    if (poloItems.length === 0) return cart;

    var totalUnidades = poloItems.reduce(function(sum, item) {
        return sum + (parseInt(item.qty) || 1);
    }, 0);

    var totalBase = getPoloPromoPrice(totalUnidades);
    var precioBaseUnitario = Math.round((totalBase / totalUnidades) * 100) / 100;

    poloItems.forEach(function(item) {
        item.price = precioBaseUnitario + (item.size === 'XL' ? 5 : 0);
    });

    return cart;
}

window.recalcularPreciosPolosCarrito = recalcularPreciosPolosCarrito;

function saveCart(cart) {
    cart = recalcularPreciosPolosCarrito(cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
}

function money(n) {
    return 'S/ ' + Number(n).toFixed(2);
}

// Envio gratis para todos los pedidos.
function calcCart(cart) {
    var items = 0, subtotal = 0;
    for (var i = 0; i < cart.length; i++) {
        var qty   = Number(cart[i].qty   || 1);
        var price = Number(cart[i].price || 0);
        items    += qty;
        subtotal += qty * price;
    }
    var envioGratis = true;
    var envio = 0;
    return { items: items, subtotal: subtotal, envio: envio, envioGratis: envioGratis, total: subtotal + envio };
}

function actualizarEnvio() {
    var cart = readCart();
    var c = calcCart(cart);
    var elEnvio   = document.getElementById('envioValor');
    var elTotal   = document.getElementById('total');
    var msgGratis = document.getElementById('msgEnvioGratis');
    var msgMas    = document.getElementById('msgLlevateMas');
    if (elEnvio)   elEnvio.textContent  = 'Gratis';
    if (elTotal)   elTotal.textContent  = money(c.total);
    if (msgGratis) msgGratis.style.display = c.envioGratis ? 'block' : 'none';
    if (msgMas)    msgMas.style.display    = 'none';
}

function render() {
    var cart = saveCart(readCart());
    var wrap = document.getElementById('carritoProductosLista');
    if (!wrap) return;

    if (cart.length === 0) {
        wrap.innerHTML = '<p class="carrito-vacio">Tu carrito esta vacio. <a href="index.html">Ver catalogo</a></p>';
        var btn = document.getElementById('btnVaciarCarrito');
        if (btn) btn.style.display = 'none';
    } else {
        wrap.innerHTML = cart.map(function(p) {
            var img   = p.image ? p.image.replace('../', '') : 'img/placeholder.png';
            var qty   = Number(p.qty   || 1);
            var price = Number(p.price || 0);
            var sub   = qty * price;
            var meta  = [];
            if (p.size) meta.push('Talla: ' + p.size);
            if (p.colorHex) meta.push('<span class="cart-color-dot" style="background:' + p.colorHex + '"></span> ' + p.color);
            else if (p.color) meta.push('Color: ' + p.color);
            return '<div class="checkout-item" data-id="' + p.id + '">' +
                '<div class="checkout-item-image"><img src="' + img + '" alt="' + (p.name || 'Producto') + '"></div>' +
                '<div class="checkout-item-info">' +
                    '<h3 class="checkout-item-name">' + (p.name || 'Producto') + '</h3>' +
                    '<p class="checkout-item-meta">' + meta.join(' | ') + '</p>' +
                    '<div class="checkout-item-qty-control">' +
                        '<button class="qty-ctrl-btn dec" data-id="' + p.id + '" type="button">-</button>' +
                        '<span class="qty-ctrl-num">' + qty + '</span>' +
                        '<button class="qty-ctrl-btn inc" data-id="' + p.id + '" type="button">+</button>' +
                        (qty >= 10 ? '<span class="qty-max-msg">Max. 10</span>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="checkout-item-price">' +
                    '<p class="checkout-item-subtotal">' + money(sub) + '</p>' +
                    '<button class="btn-del btn-eliminar" type="button" data-id="' + p.id + '">Eliminar</button>' +
                '</div>' +
            '</div>';
        }).join('');
        var btn2 = document.getElementById('btnVaciarCarrito');
        if (btn2) btn2.style.display = 'block';
    }

    var c = calcCart(cart);
    var elSub = document.getElementById('subtotal');
    if (elSub) elSub.textContent = money(c.subtotal);
    actualizarEnvio();
    var badge = document.getElementById('cartCount');
    if (badge) badge.textContent = c.items;
}

function updateQty(id, newQty) {
    var cart = readCart();
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            cart[i].qty = Math.min(10, Math.max(1, Number(newQty || 1)));
            break;
        }
    }
    saveCart(cart);
    render();
}

function removeItem(id) {
    saveCart(readCart().filter(function(p) { return p.id !== id; }));
    render();
}

// ===================================================
// MODAL ELIMINAR — sin overflow hidden
// ===================================================

var pendingDeleteId = null;

function openDeleteModal(id) {
    pendingDeleteId = id;
    var modal = document.getElementById('deleteModal');
    if (modal) modal.hidden = false;
    // NO tocamos overflow
}

function closeDeleteModal() {
    var modal = document.getElementById('deleteModal');
    if (modal) modal.hidden = true;
    pendingDeleteId = null;
}

// ===================================================
// TODO EN DOMContentLoaded
// ===================================================

document.addEventListener('DOMContentLoaded', function() {

    render();

    // ---- BOTÓN WHATSAPP ----
    var btnWA = document.getElementById('btnEnviarWhatsApp');
    if (btnWA) {
        btnWA.addEventListener('click', function() {
            var cart = readCart();

            if (!cart.length) {
                mostrarBanner('Agrega productos a tu carrito antes de pedir.');
                return;
            }

            var form       = document.getElementById('pedidoForm');
            var nombre     = form && form.nombre     ? form.nombre.value.trim()     : '';
            var distrito   = form && form.distrito   ? form.distrito.value.trim()   : '';
            var direccion  = form && form.direccion  ? form.direccion.value.trim()  : '';
            var referencia = form && form.referencia ? form.referencia.value.trim() : '';
            var metodo     = form && form.metodoEntrega ? form.metodoEntrega.value.trim() : 'shalom';
            var notas      = form && form.notas      ? form.notas.value.trim()      : '';

            var agenciaEl     = document.getElementById('agencia');
            var otraEl        = document.getElementById('otraAgencia');
            var agenciaSelect = agenciaEl ? agenciaEl.value.trim() : '';
            var otraAgencia   = otraEl    ? otraEl.value.trim()    : '';
            var agencia = agenciaSelect === 'otra' ? (otraAgencia || 'Otra agencia') : agenciaSelect;

            if (!nombre) {
                mostrarBanner('Ingresa tu nombre completo para continuar.');
                return;
            }
            if (!distrito) {
                mostrarBanner('Ingresa tu distrito para coordinar el envio.');
                return;
            }
            if (metodo === 'shalom' && !agenciaSelect) {
                mostrarBanner('Selecciona la agencia donde deseas recibir tu pedido.');
                return;
            }
            if (metodo === 'shalom' && agenciaSelect === 'otra' && !otraAgencia) {
                mostrarBanner('Escribe el nombre de tu agencia.');
                return;
            }
            if (metodo === 'shalom' && !direccion) {
                mostrarBanner('Ingresa tu direccion para coordinar el envio.');
                return;
            }

            var total = 0;
            var lineas = '';
            cart.forEach(function(p) {
                var sub = Number(p.qty || 1) * Number(p.price || 0);
                total += sub;
                lineas += '- ' + (p.name || 'Producto') + '\n';
                if (p.size)  lineas += '  Talla: ' + p.size + '\n';
                if (p.color) lineas += '  Color: ' + p.color + '\n';
                lineas += '  Cantidad: ' + (p.qty || 1) + '\n';
                lineas += '  Precio: S/ ' + Number(p.price).toFixed(2) + ' | Subtotal: S/ ' + (Number(p.qty || 1) * Number(p.price || 0)).toFixed(2) + '\n\n';
            });

            var c = calcCart(cart);
            var totalFinal  = total + c.envio;
            var metodoTexto = metodo === 'contraentrega'
                ? 'Contra entrega - solo Lima (pagas al recibir)'
                : 'Envio por agencia: ' + agencia;

            var msg = '*PEDIDO REXOFIT*\n\n';
            msg += '*DATOS DEL CLIENTE*\n';
            msg += 'Nombre: '   + nombre   + '\n';
            msg += 'Distrito: ' + distrito + '\n';
            if (metodo === 'shalom') {
                msg += 'Agencia: '   + agencia   + '\n';
                msg += 'Direccion: ' + direccion + '\n';
                if (referencia) msg += 'Referencia: ' + referencia + '\n';
            }
            msg += 'Metodo de entrega: ' + metodoTexto + '\n';
            if (notas) msg += 'Notas: ' + notas + '\n';
            msg += '\n*RESUMEN DEL PEDIDO*\n' + lineas;
            msg += '------------------\n';
            msg += 'Subtotal: S/ ' + total.toFixed(2) + '\n';
            msg += 'Envio: Gratis\n';
            msg += '*TOTAL: S/ ' + totalFinal.toFixed(2) + '*\n\n';
            msg += 'Por favor confirmar disponibilidad.';

            window.open('https://wa.me/51929896007?text=' + encodeURIComponent(msg), '_blank');
        });
    }

    // ---- MODAL ELIMINAR ----
    var btnCancel = document.getElementById('btnCancelDel');
    var btnOk     = document.getElementById('btnOkDel');
    var backdrop  = document.querySelector('.modal-del__backdrop');
    if (btnCancel) btnCancel.onclick = function(e) { e.preventDefault(); closeDeleteModal(); };
    if (btnOk)     btnOk.onclick     = function(e) { e.preventDefault(); if (pendingDeleteId) removeItem(pendingDeleteId); closeDeleteModal(); };
    if (backdrop)  backdrop.onclick  = function() { closeDeleteModal(); };

    // ---- ELIMINAR delegado ----
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.btn-del');
        if (btn && btn.dataset.id) openDeleteModal(btn.dataset.id);
    });

    // ---- CANTIDAD delegado ----
    document.addEventListener('click', function(e) {
        var inc = e.target.closest('.inc');
        if (inc && inc.dataset.id) {
            var item = readCart().find(function(p) { return p.id === inc.dataset.id; });
            if (item) updateQty(inc.dataset.id, item.qty + 1);
            return;
        }
        var dec = e.target.closest('.dec');
        if (dec && dec.dataset.id) {
            var item2 = readCart().find(function(p) { return p.id === dec.dataset.id; });
            if (item2) updateQty(dec.dataset.id, item2.qty - 1);
        }
    });

    // ---- VACIAR ----
    var btnVaciar = document.getElementById('btnVaciarCarrito');
    if (btnVaciar) {
        btnVaciar.onclick = function() {
            if (window.confirm('Se eliminaran todos los productos. Continuar?')) {
                saveCart([]);
                render();
            }
        };
    }

});
