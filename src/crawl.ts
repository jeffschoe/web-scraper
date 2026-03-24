import { JSDOM }  from 'jsdom';
import pLimit, { LimitFunction } from 'p-limit';


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

export type ExtractedPageData = {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function extractPageData(
  html: string,
  pageURL: string,
): ExtractedPageData {
  return {
    url: pageURL,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}


class ConcurrentCrawler {
  private baseURL: string; //starting URL
  private pages: Record<string, ExtractedPageData>; //Record of page visit counts
  private limit: LimitFunction;
  private maxPages: number; //max number of unique pages to crawl
  private shouldStop = false;
  private allTasks = new Set<Promise<void>>();
  private visited = new Set<string>();

  constructor(
    baseURL: string, 
    maxConcurrency: number = 5, 
    maxPages: number = 100
  ) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
    this.maxPages = Math.max(1, maxPages);
  }

  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) {
      return false;
    }
    if (this.visited.has(normalizedURL)) { //if we've seen this pages before
      return false;
    }  
    if (this.visited.size >= this.maxPages) {
      this.shouldStop = true;
      console.log(`Reached maximum number of pages to crawl.`)
      return false;
    }

    this.visited.add(normalizedURL);
    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    return await this.limit(async () => {
    let res;
    try {
      res = await fetch(currentURL, {
        headers: { "User-Agent": "BootCrawler/1.0" },
      });
    } catch (err) {
      throw new Error(`Got Network error: ${(err as Error).message}`);
    }

    if (res.status > 399) {
      throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      throw new Error(`Got non-HTML response: ${contentType}`);
    }

    return res.text();
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {  
    if (this.shouldStop) {
      return;
    }
    const baseURLObj = new URL(this.baseURL);
    const currentURLObj = new URL(currentURL);
    if (currentURLObj.hostname !== baseURLObj.hostname) {
      return;
    }

    const normalizedURL = normalizeURL(currentURL); //we normalize so that pages with minor formatting differnces, but are actually the same, don't get double/triple counted
    if (!this.addPageVisit(normalizedURL)) {
      return;
    };

    console.log(`crawling ${currentURL}`);
    let html = "";
    try {
      html = await this.getHTML(currentURL);
    } catch (err) {
      console.log(`${(err as Error).message}`);
      return;
    }

    const data = extractPageData(html, currentURL);
    this.pages[normalizedURL] = data;

    const crawlPromises: Promise<void>[] = []
    for (const nextURL of data.outgoing_links) {
      if (this.shouldStop) break;

      const task = this.crawlPage(nextURL);
      this.allTasks.add(task)
      task.finally(() => this.allTasks.delete(task))
      crawlPromises.push(task);
    }

    await Promise.all(crawlPromises);
  }


  async crawl(): Promise<Record<string, ExtractedPageData>> {
    const rootTask = this.crawlPage(this.baseURL);
    this.allTasks.add(rootTask);
    try {
      await rootTask;
    } finally {
      this.allTasks.delete(rootTask);
    }
    await Promise.allSettled(Array.from(this.allTasks));
    return this.pages;
  }

}

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
  maxPages: number = 100,
): Promise<Record<string, ExtractedPageData>> {
  const concurrentCrawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  const pages = await concurrentCrawler.crawl();
  return pages;
}
