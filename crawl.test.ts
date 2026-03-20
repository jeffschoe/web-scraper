import { test, expect } from "vitest";
import { 
  getHeadingFromHTML, 
  normalizeURL,
  getFirstParagraphFromHTML,
  getURLsFromHTML,
  getImagesFromHTML,
  extractPageData,
} from "./crawl";

// normalizeURL
test("normalizeURL protocol", () => {
  const input = "https://crawler-test.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL slash", () => {
  const input = "https://crawler-test.com/path/";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL capitals", () => {
  const input = "https://CRAWLER-TEST.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL http", () => {
  const input = "http://CRAWLER-TEST.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});


// getHeadingFromHTML
test("getHeadingFromHTML h1 basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML h2 basic", () => {
  const inputBody = `<html><body><h2>Test Heading 2</h2></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Heading 2";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML h1 and h2 basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1><h2>Test Heading 2</h2></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML missing h1 and h2", () => {
  const inputBody = `<html><body></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = '';
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML empty h1", () => {
  const inputBody = `<html><body><h1></h1></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getHeadingFromHTML empty h2", () => {
  const inputBody = `<html><body><h2></h2></body></html>`;
  const actual = getHeadingFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});


// getFirstParagraphFromHTML
test("getFirstParagraphFromHTML main one paragraph", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main two paragraphs", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
        <p>Main paragraph 2.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main two paragraphs, two outside paragraphs", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph 1.</p>
      <p>Outside paragraph 2.</p>
      <main>
        <p>Main paragraph.</p>
        <p>Main paragraph 2.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main without paragraph, one outside paragraph", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main without paragraph, two outside paragraph", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph 1.</p>
      <p>Outside paragraph 2.</p>
      <main>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph 1.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main missing, two outside paragraph", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph 1.</p>
      <p>Outside paragraph 2.</p>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph 1.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML no paragraphs, main present", () => {
  const inputBody = `
    <html><body>
      <main>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML no paragraphs, no main", () => {
  const inputBody = `
    <html><body>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

// getURLsFromHTML
test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML two anchors", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span><a href="/path/two"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one", "https://crawler-test.com/path/two"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML missing href", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML missing anchor", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML both absolute and relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody =
    `<html><body>` +
    `<a href="/path/one"><span>Boot.dev</span></a>` +
    `<a href="https://other.com/path/one"><span>Boot.dev</span></a>` +
    `</body></html>`;
  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/path/one",
    "https://other.com/path/one",
  ];
  expect(actual).toEqual(expected);
});


// getImagesFromHTML
test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="https://crawler-test.com/logo.png" alt="Logo"></body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];
  expect(actual).toEqual(expected);
});

test("getImagesFromHTML missing src", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML missing img", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML two images", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"><img src="/logo2.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png", "https://crawler-test.com/logo2.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody =
    `<html><body>` +
    `<img src="/logo.png" alt="Logo">` +
    `<img src="https://cdn.boot.dev/banner.jpg">` +
    `</body></html>`;
  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = [
    "https://crawler-test.com/logo.png",
    "https://cdn.boot.dev/banner.jpg",
  ];
  expect(actual).toEqual(expected);
});


//extractPageData
test("extract_page_data basic", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extract_page_data main section priority", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <nav><p>Navigation paragraph</p></nav>
      <main>
        <h1>Main Title</h1>
        <p>Main paragraph content.</p>
      </main>
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  expect(actual.heading).toEqual("Main Title");
  expect(actual.first_paragraph).toEqual("Main paragraph content.");
});

test("extract_page_data missing elements", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><div>No h1, p, links, or images</div></body></html>`;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "",
    first_paragraph: "",
    outgoing_links: [],
    image_urls: [],
  };

  expect(actual).toEqual(expected);
});