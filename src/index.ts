import { argv } from "node:process";
import { crawlSiteAsync } from "./crawl";


async function main() {
  const args = argv;
  const argsLen = args.length;
  const expectedNumArgs = 5;
 
  if (argsLen < expectedNumArgs) {
    console.log("too few arguments provided");
    console.log(printUsage())
    process.exit(1);
  }
  if (argsLen > expectedNumArgs) {
    console.log("too many arguments provided");
    console.log(printUsage())
    process.exit(1);
  } 
  const baseURL = process.argv[2];
  const maxConcurrency = Number(process.argv[3]);
  const maxPages = Number(process.argv[4]);

  console.log(
    `\nstarting crawl of: ${baseURL} with max concurrency of ${maxConcurrency} and max pages of ${maxPages}`
  );

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

  for (const [page, visits ] of Object.entries(pages)) {
    console.log(`page: ${page}, visits: ${visits}`)
  }

  process.exit(0);
  
}

function printUsage(): string {
  const usage = "\nusage: npm run start <URL> <maxConcurrency> <maxPages>"
  return usage;
}

main ();