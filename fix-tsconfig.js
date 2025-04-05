// // fix-tsconfig.js
// // const fs = require("fs");
// import fs from "fs"; // replaces line above
// // red squiggle is appearing on line above under require("fs"): A `require()` style import is forbidden.eslint@typescript-eslint/no-require-imports var require: NodeJS.Require (id: string) => any (+1 overload) Used to import modules, JSON, and local files.

// const tsconfigPath = "./tsconfig.json";

// const raw = fs.readFileSync(tsconfigPath, "utf-8");
// const config = JSON.parse(raw);

// // ✅ Strip .next/types from the include array
// config.include = config.include?.filter(
//   (entry) => !entry.includes(".next/types")
// );

// fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, 2));
// console.log("✅ Patched tsconfig.json before build");

// above replaced by below


// fix-tsconfig.js
/* eslint-disable @typescript-eslint/no-require-imports */
// import fs from "fs";
const fs = require("fs");

const tsconfigPath = "./tsconfig.json";

const raw = fs.readFileSync(tsconfigPath, "utf-8");
const config = JSON.parse(raw);

// Strip '.next/types/**/*.ts' from include array if it got added
if (Array.isArray(config.include)) {
  config.include = config.include.filter(
    (entry) => !entry.includes(".next/types")
  );
}

fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, 2));
console.log("✅ Cleaned tsconfig.json after Next.js attempted rewrite");
