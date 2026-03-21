import { argv } from "node:process";
import { getHTML } from "./crawl";


async function main() {
  const args = argv;
  const argsLen = args.length;
 
  if (argsLen < 3) {
    console.log("no website provided");
    process.exit(1);
  }
  if (argsLen > 3) {
    console.log("too many arguments provided");
    process.exit(1);
  } 
  const baseURL = process.argv[2];

  console.log(`starting crawl of: ${baseURL}...`);

  const html = await getHTML(baseURL);
  console.log(html);
  
}



main ();