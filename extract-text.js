// extract-text.js
import fs from "fs";
import path from "path";

const folder = "./app"; // change this to ./src if your files are in src

let allText = [];

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      scan(full);
    } else if (file.endsWith(".jsx") || file.endsWith(".js") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(full, "utf8");

      // Extract text between > TEXT <
      const regex = />\s*([^<{]+?)\s*</g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 0 && isNaN(text)) allText.push(text);
      }
    }
  }
}

scan(folder);

fs.writeFileSync("texts.json", JSON.stringify(allText, null, 2));
console.log("Done! Extracted:", allText.length, "texts");
