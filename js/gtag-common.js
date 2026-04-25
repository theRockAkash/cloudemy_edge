// --- Initialization (unchanged) ---
(function () {
  if (window.gtag) return;

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-KYRF5N9H70";
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    dataLayer.push(arguments);
  };

  gtag("js", new Date());
  gtag("config", "G-KYRF5N9H70");
})();

// --- Event helper (unchanged) ---
function gtagSendEvent(url) {
  var callback = function () {
    if (typeof url === "string") {
      window.location = url;
    }
  };
  gtag("event", "conversion_event_submit_lead_form", {
    event_callback: callback,
    event_timeout: 2000,
  });
  return false;
}