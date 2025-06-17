// vercel-trigger.js
const fs = require('fs');

const triggerFile = './vercel-deploy-trigger.txt';
const time = new Date().toISOString();

fs.writeFileSync(triggerFile, `# Triggered at ${time}`);
console.log(`✅ Trigger file updated at ${time}`);
