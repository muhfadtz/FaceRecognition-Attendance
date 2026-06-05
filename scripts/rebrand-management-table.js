const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/dashboard/management/page.tsx');
if (!fs.existsSync(targetPath)) {
  console.error("Management page.tsx not found!");
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf-8');

// Replace table card container background and border
content = content.replace(/bg-white rounded-md border border-neutral-200 shadow-\[0_1px_2px_rgba\(0,0,0,0\.04\)\]/g, 'bg-card rounded-md border border-border shadow-sm');
content = content.replace(/bg-white rounded-lg border border-neutral-200/g, 'bg-card rounded-md border border-border');

// Replace header cell text colors to support theme-appropriate text-foreground
content = content.replace(/text-gray-900 dark:text-white/g, 'text-foreground');
content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-foreground/80');

// Replace cell background to bg-card instead of bg-white/gray-800
content = content.replace(/bg-white dark:bg-gray-800/g, 'bg-card');

fs.writeFileSync(targetPath, content, 'utf-8');
console.log("Successfully rebranded table backgrounds and text colors in management/page.tsx");
