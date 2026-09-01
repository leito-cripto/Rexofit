(function() {
    var STORAGE_KEY = 'rexofit_promo_end';
    var DEFAULT_SECONDS = 2 * 60 * 60; // 2 horas

    var banner = document.getElementById('promoBanner');
    if (!banner) return;

    // Calcular o restaurar tiempo de fin
    var endTime = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!endTime || endTime < Date.now()) {
        endTime = Date.now() + DEFAULT_SECONDS * 1000;
        localStorage.setItem(STORAGE_KEY, endTime);
    }

    // Soporte para ambos formatos de display
    var promoTime   = document.getElementById('promoTime');   // franja delgada (index.html)
    var clockH      = document.getElementById('clockH');       // reloj separado (legacy)
    var clockM      = document.getElementById('clockM');
    var clockS      = document.getElementById('clockS');
    var legacyDisplay = document.getElementById('promoTimer'); // header antiguo

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function tick() {
        var remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        var h = Math.floor(remaining / 3600);
        var m = Math.floor((remaining % 3600) / 60);
        var s = remaining % 60;
        var formatted = pad(h) + ':' + pad(m) + ':' + pad(s);

        if (remaining <= 0) {
            if (promoTime)    promoTime.textContent    = '00:00:00';
            if (clockH)       clockH.textContent       = '00';
            if (clockM)       clockM.textContent       = '00';
            if (clockS)       clockS.textContent       = '00';
            if (legacyDisplay) legacyDisplay.textContent = '00:00:00';
            banner.dataset.ended = 'true';
            return;
        }

        if (promoTime)    promoTime.textContent    = formatted;
        if (clockH)       clockH.textContent       = pad(h);
        if (clockM)       clockM.textContent       = pad(m);
        if (clockS)       clockS.textContent       = pad(s);
        if (legacyDisplay) legacyDisplay.textContent = formatted;

        setTimeout(tick, 1000);
    }

    tick();
})();

