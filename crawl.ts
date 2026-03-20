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

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = [];
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const anchors = doc.querySelectorAll("a");

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href) return;

      try {
        const absoluteURL = new URL(href, baseURL).toString();
        urls.push(absoluteURL);
      } catch (err) {
        console.error(`invalid href '${href}':`, err);
      }
    });
  } catch (err) {
    console.error("failed to parse HTML:", err);
  }
  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const imageURLs: string[] = [];
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const images = doc.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (!src) return;

      try {
        const absoluteURL = new URL(src, baseURL).toString();
        imageURLs.push(absoluteURL);
      } catch (err) {
        console.error(`invalid src '${src}':`, err);
      }
    });
  } catch (err) {
    console.error("failed to parse HTML:", err);
  }
  return imageURLs;
}