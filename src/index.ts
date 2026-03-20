import { argv } from "node:process";





function main() {


  const args = argv;

  /*
  console.log(`args.length = ${args.length}`)
  argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  }); 

  const arr = ["A", "B", "C"]
  arr.forEach(
    (element) => {
      const lower = element.toLowerCase();
      console.log(`element = ${lower}`);
    }
    
  );
  */

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

  process.exit(0);
  

}



main ();