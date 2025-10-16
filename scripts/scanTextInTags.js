// scanTextInTags.js
import fs from "fs";
import path from "path";

const targetDir = "./src"; // 你要扫描的目录
const regex = />[^<>]+?</g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(tsx|jsx|html)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      const matches = content.match(regex);
      if (matches) {
        console.log(`\n📄 File: ${fullPath}`);
        matches.forEach(m => {
          const text = m.slice(1, -1).trim();
          if (text) console.log(`  👉 ${text}`);
        });
      }
    }
  }
}

walk(targetDir);
