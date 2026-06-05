const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/dashboard/management/page.tsx');
if (!fs.existsSync(targetPath)) {
  console.error("Management page.tsx not found!");
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf-8');

// Replace refresh button blue color
content = content.replace(/bg-blue-600 text-white rounded-md hover:bg-blue-700/g, 'bg-primary text-primary-foreground rounded-md hover:bg-primary/90');

// Replace residual emerald classes
content = content.replace(/dark:border-emerald-800/g, 'dark:border-border');
content = content.replace(/dark:border-emerald-700/g, 'dark:border-border');
content = content.replace(/dark:text-emerald-300/g, 'dark:text-primary-foreground');
content = content.replace(/focus:ring-emerald-600/g, 'focus:ring-primary');
content = content.replace(/dark:focus:ring-emerald-600/g, 'dark:focus:ring-primary');

fs.writeFileSync(targetPath, content, 'utf-8');
console.log("Successfully cleaned residual emerald/blue variables in management/page.tsx");
