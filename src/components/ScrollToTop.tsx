import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        setTimeout(() => {
          const el2 = document.querySelector(hash);
          if (el2) {
            el2.scrollIntoView({ behavior: "auto", block: "start" });
          }
        }, 50);
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, hash]);

  return null;
}
