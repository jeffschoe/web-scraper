import { test, expect } from "vitest";
import { 
  getHeadingFromHTML, 
  normalizeURL,
  getFirstParagraphFromHTML,
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