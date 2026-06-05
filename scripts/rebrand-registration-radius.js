const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/dashboard/registration/page.tsx');
if (!fs.existsSync(targetPath)) {
  console.error("Registration page.tsx not found!");
  process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf-8');

// Replace rounded classes to align with sharp Tahoe design
content = content.replace(/rounded-2xl/g, 'rounded-md');
content = content.replace(/rounded-xl/g, 'rounded-md');
content = content.replace(/rounded-lg/g, 'rounded-md');

fs.writeFileSync(targetPath, content, 'utf-8');
console.log("Successfully updated layout radius parameters in registration/page.tsx");
