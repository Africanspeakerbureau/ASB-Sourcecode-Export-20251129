let t;
export function toast(msg, ms = 1600) {
  if (!msg) return;
  if (!t) {
    t = document.createElement('div');
    t.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:11000;max-width:80vw;padding:10px 14px;border-radius:10px;background:#111;color:#fff;font:500 14px/1.3 system-ui, -apple-system, Segoe UI, Roboto;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.style.opacity = '0'; }, ms);
}
