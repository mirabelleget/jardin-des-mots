/* Bandeau « Ouvrir dans Safari » : affiché seulement quand la page est ouverte
   depuis l'appli Instagram, Facebook ou Messenger (navigateur interne).
   Type de contenu : <script src="..." data-type="app"> (application) ou data-type="pdf" (fiche PDF).
   Test sur ordinateur : ajouter ?safari=1 à l'adresse. */
(function () {
  var ua = navigator.userAgent || "";
  var force = /[?&]safari=1\b/.test(location.search);
  var inApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger|MessengerForiOS/i.test(ua);
  if (!inApp && !force) return;

  var me = document.currentScript;
  var type = (me && me.getAttribute("data-type")) || "app";
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var appli = /Instagram/i.test(ua) ? "Instagram" : (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger/i.test(ua) ? "Facebook" : "Instagram ou Facebook");
  var url = location.href.replace(/([?&])safari=1(&|$)/, "$1").replace(/[?&]$/, "");
  var nav = isAndroid ? "Chrome" : "Safari";

  var pourquoi = type === "pdf"
    ? "📄 C'est une fiche PDF. Pour bien l'enregistrer ou l'imprimer, ouvrez-la dans " + nav + "."
    : (type === "liste"
      ? "Ici, " + appli + " ouvre les liens dans sa propre fenêtre. Pour garder les outils sur votre téléphone, ouvrez cette page dans " + nav + "."
      : "📱 C'est une application. Dans " + appli + ", vous ne pouvez pas l'ajouter à votre téléphone : ouvrez-la dans " + nav + ".");
  var ensuite = type === "pdf"
    ? "Puis touchez <b>Partager</b> ⬆️ › <b>Enregistrer dans Fichiers</b> ou <b>Imprimer</b>."
    : (isAndroid
      ? "Puis menu <b>⋮</b> › <b>Ajouter à l'écran d'accueil</b> : l'application sera sur votre téléphone, comme une vraie appli."
      : "Puis touchez <b>Partager</b> ⬆️ › <b>Sur l'écran d'accueil</b> : l'application sera sur votre téléphone, comme une vraie appli.");

  var css = "#oSafari{position:relative;z-index:99999;background:#fff;color:#173f42;border-bottom:4px solid #0b8a92;box-shadow:0 4px 14px rgba(0,0,0,.15);font:16px/1.4 system-ui,-apple-system,sans-serif;padding:12px 14px 14px;padding-top:max(12px,env(safe-area-inset-top))}" +
    "#oSafari .in{max-width:560px;margin:auto;position:relative}" +
    "#oSafari b.t{display:block;font-size:18px;color:#0b8a92;margin:0 30px 4px 0}" +
    "#oSafari p{margin:4px 0}" +
    "#oSafari .bt{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 6px}" +
    "#oSafari .bt a,#oSafari .bt button{flex:1 1 140px;border:0;border-radius:12px;padding:12px 10px;font:800 16px system-ui,-apple-system,sans-serif;text-align:center;text-decoration:none;cursor:pointer}" +
    "#oSafari .go{background:#0b8a92;color:#fff}" +
    "#oSafari .cp{background:#f6d3da;color:#7a2f43}" +
    "#oSafari .x{position:absolute;top:-4px;right:-4px;background:none;border:0;font-size:26px;line-height:1;color:#557479;padding:4px 8px;cursor:pointer}" +
    "#oSafari .ok{color:#2f8f5b;font-weight:800}" +
    "#oSafari small{display:block;color:#557479;font-size:14px;margin-top:4px}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var goHref = isIOS ? "x-safari-" + url
    : (isAndroid ? "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(url) + ";end" : url);

  var box = document.createElement("div");
  box.id = "oSafari";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Ouvrir dans " + nav);
  box.innerHTML = '<div class="in">' +
    '<button class="x" type="button" aria-label="Fermer">×</button>' +
    '<b class="t">Ouvrir dans ' + nav + '</b>' +
    '<p>' + pourquoi + '</p>' +
    '<div class="bt">' +
    '<a class="go" href="' + goHref + '">🧭 Ouvrir dans ' + nav + '</a>' +
    '<button class="cp" type="button">🔗 Copier le lien</button>' +
    '</div>' +
    '<p class="msg" aria-live="polite"></p>' +
    '<p>' + ensuite + '</p>' +
    '<small>Si le bouton ne marche pas : touchez <b>⋯</b> en haut à droite › <b>Ouvrir dans le navigateur</b>, ou copiez le lien et collez-le dans ' + nav + '.</small>' +
    '</div>';

  function poser() { document.body.insertBefore(box, document.body.firstChild); }
  if (document.body) poser(); else document.addEventListener("DOMContentLoaded", poser);

  box.querySelector(".x").onclick = function () { box.remove(); };
  var msg = box.querySelector(".msg");
  box.querySelector(".cp").onclick = function () {
    function ok() { msg.innerHTML = '<span class="ok">✓ Lien copié !</span> Ouvrez ' + nav + ', touchez la barre d\'adresse et choisissez <b>Coller et aller</b>.'; }
    function secours() {
      var t = document.createElement("textarea");
      t.value = url; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, url.length);
      var r = false; try { r = document.execCommand("copy"); } catch (e) {}
      t.remove();
      if (r) ok(); else msg.innerHTML = "Copiez ce lien : <b>" + url + "</b>";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, secours);
    else secours();
  };
})();
