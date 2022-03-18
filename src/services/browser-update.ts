(globalThis as any).$buoop = {
  required: { e: -4, f: -3, o: -3, s: -1, c: -3 },
  unsupported: true,
  insecure: true,
  api: 2022.03,
};
function $buo_f() {
  const e = document.createElement("script");
  e.src = "//browser-update.org/update.min.js";
  document.body.appendChild(e);
}
try {
  document.addEventListener("DOMContentLoaded", $buo_f, false);
} catch (e) {
  (window as any).attachEvent("onload", $buo_f);
}
