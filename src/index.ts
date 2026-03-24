import { argv } from "node:process";
import { crawlSiteAsync } from "./crawl";
import { writeJSONReport } from "./report";


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

  if (!Number.isFinite(maxConcurrency) || maxConcurrency <= 0) {
    console.log("invalid maxConcurrency");
    console.log(printUsage())
    process.exit(1);
  }
  if (!Number.isFinite(maxPages) || maxPages <= 0) {
    console.log("invalid maxPages");
    console.log(printUsage())
    process.exit(1);
  }

  console.log(
    `starting crawl of: ${baseURL} (concurrency=${maxConcurrency}, maxPages=${maxPages})...`,
  );

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

  for (const [url, data] of Object.entries(pages)) {
    console.log(`${url}: ${data.heading}`);
  }

  console.log("Finished crawling.");
  const firstPage = Object.values(pages)[0];
  if (firstPage) {
    console.log(
      `First page record: ${firstPage["url"]} - ${firstPage["heading"]}`,
    ); 
  }

  writeJSONReport(pages, "report.json");

  process.exit(0);

}

function printUsage(): string {
  const usage = "\nusage: npm run start <URL> <maxConcurrency> <maxPages>"
  return usage;
}

main ();