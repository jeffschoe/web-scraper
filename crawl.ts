import { JSDOM }  from 'jsdom';




export function normalizeURL(url: string) {
  // https://nodejs.org/api/url.html#url-strings-and-url-objects
  const urlObj = new URL(url);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  if (fullPath.slice(-1) === '/') {
    fullPath = fullPath.slice(0, -1);
  }
  return fullPath; 
}

export function getHeadingFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const heading = doc.querySelector("h1") ?? doc.querySelector("h2"); // The ?? (nullish coalescing) operator means "use the left side if it's not null/undefined, otherwise use the right side."
    return (heading?.textContent ?? "").trim(); // The ?. is optional chaining. If h1 is null or undefined, this short-circuits and returns undefined instead of throwing an error.
  } catch {
    return "";
  }
}

export function getFirstParagraphFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const main = doc.querySelector("main");
    const p = main?.querySelector("p") ?? doc.querySelector("p"); // `main?` short-circuits the left side to undefined, in the case of main being null, which gives us the right side. Without it, we would throw an error on the expression itself.
    return (p?.textContent ?? "").trim();
  } catch {
    return "";
  }
}