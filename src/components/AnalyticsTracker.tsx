import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { recordAnalytics } from "@/lib/radio.functions";
import { getCookieChoice } from "./CookieConsent";

function deviceType() {
  if (typeof navigator === "undefined") return "desconocido" as const;
  return /tablet|ipad/i.test(navigator.userAgent) ? "tablet" as const : /mobile|android|iphone/i.test(navigator.userAgent) ? "móvil" as const : "ordenador" as const;
}

export default function AnalyticsTracker() {
  const page = useLocation({ select: (l) => l.pathname || "/" });
  const record = useServerFn(recordAnalytics);
  const [enabled, setEnabled] = useState(false);
  const startedAt = useRef(Date.now());
  const sentEnd = useRef(false);

  useEffect(() => {
    setEnabled(getCookieChoice() === "accepted");
    const onConsent = (event: Event) => setEnabled((event as CustomEvent).detail === "accepted");
    window.addEventListener("radio-patio-consent-changed", onConsent);
    return () => window.removeEventListener("radio-patio-consent-changed", onConsent);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const send = (data: Parameters<typeof record>[0]["data"]) => { record({ data }).catch(() => {}); };
    startedAt.current = Date.now();
    sentEnd.current = false;
    send({ page, eventType: "page_view", deviceType: deviceType() });
    const duration = () => Math.min(3600, Math.round((Date.now() - startedAt.current) / 1000));
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") send({ page, eventType: "session_end", durationSeconds: duration(), deviceType: deviceType() });
    }, 30_000);
    const sendEnd = () => {
      if (sentEnd.current) return;
      sentEnd.current = true;
      if (document.visibilityState === "hidden") send({ page, eventType: "session_end", durationSeconds: duration(), deviceType: deviceType() });
    };
    document.addEventListener("visibilitychange", sendEnd);
    window.addEventListener("pagehide", sendEnd);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", sendEnd); window.removeEventListener("pagehide", sendEnd); sendEnd(); };
  }, [enabled, page]);

  return null;
}
