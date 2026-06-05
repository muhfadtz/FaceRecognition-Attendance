const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/dashboard/management/page.tsx');
if (!fs.existsSync(targetPath)) {
  console.error("Management page.tsx not found!");
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf-8');

// Replace background gradients
content = content.replace(/bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800/g, 'bg-background');
content = content.replace(/bg-gradient-to-br from-emerald-50 to-teal-50/g, 'bg-background');

// Replace emerald colors
content = content.replace(/bg-emerald-600/g, 'bg-primary');
content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-primary/90');
content = content.replace(/text-emerald-600/g, 'text-primary');
content = content.replace(/text-emerald-500/g, 'text-primary');
content = content.replace(/text-emerald-700/g, 'text-primary');
content = content.replace(/dark:text-emerald-400/g, 'dark:text-primary');

// Replace emerald backgrounds
content = content.replace(/bg-emerald-50/g, 'bg-secondary');
content = content.replace(/bg-emerald-100/g, 'bg-secondary/80');
content = content.replace(/dark:bg-emerald-900\/20/g, 'dark:bg-primary/10');
content = content.replace(/dark:bg-emerald-900\/30/g, 'dark:bg-primary/20');
content = content.replace(/dark:bg-emerald-900\/10/g, 'dark:bg-primary/5');
content = content.replace(/hover:bg-emerald-50/g, 'hover:bg-secondary');
content = content.replace(/hover:bg-emerald-100/g, 'hover:bg-secondary/90');
content = content.replace(/dark:hover:bg-emerald-900\/10/g, 'dark:hover:bg-primary/5');
content = content.replace(/dark:hover:bg-emerald-900\/30/g, 'dark:hover:bg-primary/20');

// Replace borders
content = content.replace(/border-emerald-100/g, 'border-border');
content = content.replace(/border-emerald-200/g, 'border-border');
content = content.replace(/border-emerald-300/g, 'border-border');
content = content.replace(/border-emerald-500/g, 'border-primary');
content = content.replace(/focus:ring-emerald-500/g, 'focus:ring-primary');
content = content.replace(/focus:border-emerald-500/g, 'focus:border-primary');

// Scrollbars
content = content.replace(/scrollbar-thumb-emerald-500/g, 'scrollbar-thumb-primary/50');
content = content.replace(/scrollbar-track-emerald-100/g, 'scrollbar-track-secondary');

// Spinner
content = content.replace(/border-emerald-600/g, 'border-primary');

fs.writeFileSync(targetPath, content, 'utf-8');
console.log("Successfully rebranded colors in management/page.tsx");
