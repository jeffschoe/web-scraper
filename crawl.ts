



export function normalizeURL(url: string) {
  // https://nodejs.org/api/url.html#url-strings-and-url-objects
  const urlObj = new URL(url);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  if (fullPath.slice(-1) === '/') {
    fullPath = fullPath.slice(0, -1);
  }
  return fullPath; 
}
