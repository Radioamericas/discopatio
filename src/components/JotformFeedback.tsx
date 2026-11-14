import { useEffect } from "react";

declare global { interface Window { JF_FeedbackEmbedButton?: new (o: Record<string, unknown>) => { componentID: string }; jotformEmbedHandler?: (sel: string, base: string) => void; __jfLoaded?: boolean } }

const load = (src: string) => new Promise<void>((res, rej) => { const s = document.createElement("script"); s.src = src; s.async = true; s.onload = () => res(); s.onerror = () => rej(); document.body.appendChild(s); });

export function JotformFeedback() {
  useEffect(() => {
    if (window.__jfLoaded) return;
    window.__jfLoaded = true;
    (async () => {
      await load("https://cdn.jotfor.ms/s/umd/latest/for-cardform-feedback-embed.js");
      if (!window.JF_FeedbackEmbedButton) return;
      const componentID = new window.JF_FeedbackEmbedButton({ buttonIcon: "default", buttonFontColor: "#FFFFFF", buttonBackgroundColor: "#007FEF", formId: 263176322319052, buttonText: "Reciba opiniones", buttonSide: "Bottom", buttonAlign: "Right", base: "https://form.jotform.com/" }).componentID;
      await load("https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js");
      window.jotformEmbedHandler?.(`iframe[id='${componentID}_iframe']`, "https://form.jotform.com/");
    })().catch(() => {});
  }, []);
  return null;
}
