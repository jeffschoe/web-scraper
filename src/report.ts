import { ExtractedPageData } from "./crawl";
import { writeFileSync} from "node:fs"
import { resolve } from 'path';


export function writeJSONReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.json",
): void {
  if (!pageData || Object.keys(pageData).length === 0) {
    console.log("No data to write to JSON");
    return;
  }

  const sorted = Object.values(pageData).sort(
    (a, b) => a.url.localeCompare(b.url),
  );

  const filePath = resolve(process.cwd(), filename);
  writeFileSync(filePath, JSON.stringify(sorted, null, 2), {
    encoding: "utf-8",
  });

  console.log(`Report written to ${filePath}`);
}
