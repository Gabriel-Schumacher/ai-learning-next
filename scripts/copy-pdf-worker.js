const fs = require('fs');
const path = require('path');

// Get the path to the installed PDF.js package
const pdfjsPath = path.dirname(require.resolve('pdfjs-dist/package.json'));

// Try to find the worker file
const possibleWorkerPaths = [
  path.join(pdfjsPath, 'build', 'pdf.worker.js'),
  path.join(pdfjsPath, 'build', 'pdf.worker.min.js'),
  path.join(pdfjsPath, 'legacy', 'build', 'pdf.worker.js'),
  path.join(pdfjsPath, 'webpack', 'pdf.worker.js')
];

let workerPath = null;
for (const path of possibleWorkerPaths) {
  if (fs.existsSync(path)) {
    workerPath = path;
    break;
  }
}

if (!workerPath) {
  console.error('Could not find PDF.js worker file');
  process.exit(1);
}

// Create the destination directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy the worker file
const destPath = path.join(publicDir, 'pdf.worker.js');
fs.copyFileSync(workerPath, destPath);

console.log(`Copied PDF.js worker to ${destPath}`);
