import { useEffect } from "react";
import { getCookieChoice } from "./CookieConsent";

const GTM_ID = "GTM-T3X3DFDP";
const SCRIPT_ID = "gtm-loader-script";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function loadGtm() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SCRIPT_ID)) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

export default function GtmLoader() {
  useEffect(() => {
    if (getCookieChoice() === "accepted") loadGtm();
    const onConsent = (event: Event) => {
      if ((event as CustomEvent).detail === "accepted") loadGtm();
    };
    window.addEventListener("radio-patio-consent-changed", onConsent);
    return () => window.removeEventListener("radio-patio-consent-changed", onConsent);
  }, []);
  return null;
}
