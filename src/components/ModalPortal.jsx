import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function getFocusable(container) {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');
  return Array.from(container.querySelectorAll(selectors))
    .filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
}

export default function ModalPortal({ children, onClose }) {
  const contentRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Lock background scroll, make app inert, remember focus
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const appRoot = document.getElementById("__next") || document.getElementById("root");
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open", "asb-modal-open");
    appRoot?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open", "asb-modal-open");
      appRoot?.removeAttribute("inert");
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus({ preventScroll: true });
      }
    };
  }, []);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return
      }
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [onClose]);

  // Trap focus inside
  useEffect(() => {
    const onTrap = (e) => {
      if (e.key !== "Tab") return;
      const root = contentRef.current;
      if (!root) return;
      const focusables = getFocusable(root);
      if (focusables.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      } else if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault(); last.focus();
      }
    };
    const root = contentRef.current;
    root?.addEventListener("keydown", onTrap);
    return () => root?.removeEventListener("keydown", onTrap);
  }, []);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-live="assertive">
      {/* Backdrop */}
      <button aria-label="Close" className="pointer-events-auto absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal container */}
      <div
        ref={contentRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="pointer-events-auto relative z-10 mx-auto my-6 sm:my-12 w-[min(92vw,900px)] rounded-2xl bg-white shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span aria-hidden>×</span>
        </button>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

