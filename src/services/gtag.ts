try {
  const tagScript = document.createElement("script");
  tagScript.async = true;
  tagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-Z6D37M29K7";
  document.head.appendChild(tagScript);

  (globalThis as any).dataLayer = (globalThis as any).dataLayer || [];
  gtag("js", new Date());
  gtag("config", "G-Z6D37M29K7");
} catch (err) {
  console.error("error in gtag init", err);
}
function gtag(...args: any[]) {
  (globalThis as any).dataLayer.push(...args);
}
