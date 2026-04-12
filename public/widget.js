(function () {
  "use strict";

  // Daily rate constants (source of truth: lib/data/daily-rates.ts)
  var DAILY_RATES = {
    population: 8100000000,
    births: 385000,
    deaths: 155000,
    co2: 115000000,
    trees: 20000,
    energy: 1580000000,
    water: 12000000000000,
    waste: 3300000,
    searches: 8500000000,
    military: 6300000000,
    education: 18000000000,
    photos: 4700000000,
    emails: 350000000000,
    internet: 500000,
    creditcards: 1500000000,
    aitokens: 35000000000,
    treesplanted: Math.round(5.8 * 86400),
    renewable: 90480000,
    plastic: Math.round(11000000 / 365),
    icelost: Math.round(1300000000000 / 365),
    soillost: Math.round(75000000000 / 365),
    flights: 100000,
    vaccines: Math.round(463 * 86400),
    hunger: 25000,
  };

  var STAT_CONFIG = {
    population:   { label: "World Population",          color: "#22c55e", abbreviated: true,  isStatic: true },
    births:       { label: "Births Today",              color: "#22c55e", abbreviated: false },
    deaths:       { label: "Deaths Today",              color: "#ef4444", abbreviated: false },
    co2:          { label: "CO\u2082 Today (tonnes)",   color: "#f97316", abbreviated: true },
    trees:        { label: "Forest Lost (hectares)",    color: "#ef4444", abbreviated: false },
    energy:       { label: "Energy Generated (MWh)",    color: "#06b6d4", abbreviated: true },
    water:        { label: "Water Used (liters)",       color: "#3b82f6", abbreviated: true },
    waste:        { label: "Food Wasted (tonnes)",      color: "#f97316", abbreviated: true },
    searches:     { label: "Google Searches",           color: "#14b8a6", abbreviated: true },
    photos:       { label: "Photos Taken",              color: "#a855f7", abbreviated: true },
    emails:       { label: "Emails Sent",               color: "#8b5cf6", abbreviated: true },
    internet:     { label: "Internet Data (PB)",        color: "#06b6d4", abbreviated: true },
    creditcards:  { label: "Credit Card Transactions",  color: "#eab308", abbreviated: true },
    aitokens:     { label: "AI Tokens Processed",       color: "#8b5cf6", abbreviated: true },
    treesplanted: { label: "Trees Planted",             color: "#22c55e", abbreviated: false },
    renewable:    { label: "Renewable Energy (MWh)",    color: "#14b8a6", abbreviated: true },
    plastic:      { label: "Plastic Entering Oceans (t)", color: "#ef4444", abbreviated: false },
    icelost:      { label: "Ice Lost (tonnes)",         color: "#3b82f6", abbreviated: true },
    soillost:     { label: "Soil Lost (tonnes)",        color: "#a3744e", abbreviated: true },
    military:     { label: "Military Spending ($)",     color: "#ef4444", abbreviated: true, prefix: "$" },
    education:    { label: "Education Spending ($)",    color: "#22c55e", abbreviated: true, prefix: "$" },
    flights:      { label: "Flights in the Air",        color: "#94a3b8", abbreviated: true, isStatic: true },
    vaccines:     { label: "Vaccines Administered",     color: "#22c55e", abbreviated: true },
    hunger:       { label: "Hunger Deaths",             color: "#ef4444", abbreviated: false },
  };

  function getSecondsSinceMidnightUTC() {
    var now = new Date();
    return now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
  }

  function formatNumber(num) {
    return Math.floor(num).toLocaleString("en-US");
  }

  function formatAbbreviated(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toLocaleString("en-US");
  }

  var STYLES = '\
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap");\
\
:host { display: inline-block; font-family: "Outfit", system-ui, sans-serif; }\
\
@keyframes en-breathe {\
  0%, 100% { opacity: 0.4; transform: scale(1); }\
  50% { opacity: 1; transform: scale(1.3); }\
}\
\
.en-container {\
  border-radius: 10px;\
  padding: 12px;\
  box-sizing: border-box;\
}\
@media (min-width: 400px) {\
  .en-container { padding: 16px 20px; }\
}\
.en-container.en-dark {\
  background: #0a0e17;\
  color: #e2e8f0;\
}\
.en-container.en-light {\
  background: #ffffff;\
  color: #1e293b;\
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);\
}\
\
.en-stats {\
  display: grid;\
  grid-template-columns: repeat(2, 1fr);\
  gap: 12px;\
}\
.en-stats.en-single {\
  grid-template-columns: 1fr;\
}\
.en-stats.en-vertical {\
  grid-template-columns: 1fr;\
  gap: 10px;\
}\
\
.en-stat {\
  display: flex;\
  flex-direction: column;\
  gap: 4px;\
  min-width: 0;\
  padding: 10px 10px;\
  border-radius: 10px;\
  overflow: hidden;\
}\
@media (min-width: 400px) {\
  .en-stat { padding: 12px 16px; }\
}\
.en-dark .en-stat {\
  background: rgba(255,255,255,0.04);\
  border: 1px solid rgba(255,255,255,0.08);\
  backdrop-filter: blur(12px);\
  -webkit-backdrop-filter: blur(12px);\
}\
.en-light .en-stat {\
  background: rgba(0,0,0,0.03);\
  border: 1px solid rgba(0,0,0,0.08);\
  backdrop-filter: blur(12px);\
  -webkit-backdrop-filter: blur(12px);\
}\
\
.en-value-row {\
  display: flex;\
  align-items: center;\
  gap: 6px;\
}\
\
.en-dot {\
  width: 5px;\
  height: 5px;\
  border-radius: 50%;\
  flex-shrink: 0;\
  animation: en-breathe 3s ease-in-out infinite;\
}\
\
.en-value {\
  font-family: "Space Mono", monospace;\
  font-size: 16px;\
  font-weight: 700;\
  letter-spacing: 0.02em;\
  font-variant-numeric: tabular-nums;\
  font-feature-settings: "tnum";\
  line-height: 1.2;\
}\
@media (min-width: 400px) {\
  .en-value { font-size: 20px; }\
}\
.en-dark .en-value { text-shadow: 0 0 12px currentColor; }\
\
.en-label {\
  font-family: "Outfit", system-ui, sans-serif;\
  font-size: 9px;\
  letter-spacing: 0.1em;\
  text-transform: uppercase;\
  line-height: 1.3;\
}\
.en-dark .en-label { color: rgba(148,163,184,0.7); }\
.en-light .en-label { color: #64748b; }\
\
.en-brand {\
  display: flex;\
  align-items: center;\
  gap: 5px;\
  margin-top: 12px;\
  text-decoration: none;\
  transition: opacity 0.2s;\
}\
.en-brand:hover { opacity: 1 !important; }\
.en-dark .en-brand { opacity: 0.45; }\
.en-light .en-brand { opacity: 0.5; }\
\
.en-brand-dot {\
  width: 5px;\
  height: 5px;\
  border-radius: 50%;\
  background: #14b8a6;\
  animation: en-breathe 4s ease-in-out infinite;\
}\
\
.en-brand-text {\
  font-family: "Outfit", system-ui, sans-serif;\
  font-size: 10px;\
  letter-spacing: 0.04em;\
}\
.en-dark .en-brand-text { color: #94a3b8; }\
.en-light .en-brand-text { color: #64748b; }\
';

  class EarthNowWidget extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._interval = null;
      this._rendered = false;
    }

    static get observedAttributes() {
      return ["stats", "theme", "layout"];
    }

    connectedCallback() {
      this._render();
      this._interval = setInterval(() => this._updateValues(), 1000);
    }

    disconnectedCallback() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }

    attributeChangedCallback() {
      if (this._rendered) this._render();
    }

    _getConfig() {
      var statsAttr = this.getAttribute("stats") || "population,co2,births";
      var stats = statsAttr.split(",").map(function (s) { return s.trim(); }).filter(function (s) { return STAT_CONFIG[s]; });
      if (stats.length === 0) stats = ["population", "co2", "births"];
      var theme = this.getAttribute("theme") === "light" ? "light" : "dark";
      var layout = this.getAttribute("layout") === "vertical" ? "vertical" : "horizontal";
      return { stats: stats, theme: theme, layout: layout };
    }

    _render() {
      var config = this._getConfig();
      var shadow = this._shadow;

      // Clear
      shadow.innerHTML = "";

      // Style
      var style = document.createElement("style");
      style.textContent = STYLES;
      shadow.appendChild(style);

      // Container
      var container = document.createElement("div");
      container.className = "en-container en-" + config.theme;

      // Stats wrapper
      var statsEl = document.createElement("div");
      statsEl.className = "en-stats" + (config.layout === "vertical" ? " en-vertical" : "") + (config.stats.length === 1 ? " en-single" : "");

      for (var i = 0; i < config.stats.length; i++) {
        var key = config.stats[i];
        var sc = STAT_CONFIG[key];
        if (!sc) continue;

        var stat = document.createElement("div");
        stat.className = "en-stat";

        // Value row (dot + number)
        var valueRow = document.createElement("div");
        valueRow.className = "en-value-row";

        var dot = document.createElement("span");
        dot.className = "en-dot";
        dot.style.background = sc.color;
        dot.style.boxShadow = "0 0 4px " + sc.color;
        dot.style.animationDelay = (i * 0.5) + "s";
        valueRow.appendChild(dot);

        var value = document.createElement("span");
        value.className = "en-value";
        value.setAttribute("data-stat", key);
        value.style.color = sc.color;
        value.textContent = "—";
        valueRow.appendChild(value);

        stat.appendChild(valueRow);

        // Label
        var label = document.createElement("span");
        label.className = "en-label";
        label.textContent = sc.label;
        stat.appendChild(label);

        statsEl.appendChild(stat);
      }

      container.appendChild(statsEl);

      // Branding (always shown)
      var brand = document.createElement("a");
      brand.className = "en-brand";
      brand.href = "https://earthnow.app?ref=widget";
      brand.target = "_blank";
      brand.rel = "noopener";

      var brandDot = document.createElement("span");
      brandDot.className = "en-brand-dot";
      brand.appendChild(brandDot);

      var brandText = document.createElement("span");
      brandText.className = "en-brand-text";
      brandText.textContent = "EarthNow";
      brand.appendChild(brandText);

      container.appendChild(brand);
      shadow.appendChild(container);

      this._rendered = true;
      this._updateValues();
    }

    _updateValues() {
      var seconds = getSecondsSinceMidnightUTC();
      var els = this._shadow.querySelectorAll("[data-stat]");
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var key = el.getAttribute("data-stat");
        var sc = STAT_CONFIG[key];
        var rate = DAILY_RATES[key];
        if (!sc || rate === undefined) continue;

        var val;
        if (sc.isStatic) {
          val = rate;
        } else {
          val = (rate / 86400) * seconds;
        }

        var formatted;
        if (sc.abbreviated) {
          formatted = formatAbbreviated(val);
        } else {
          formatted = formatNumber(val);
        }

        el.textContent = (sc.prefix || "") + formatted;
      }
    }
  }

  if (!customElements.get("earth-now")) {
    customElements.define("earth-now", EarthNowWidget);
  }
})();
