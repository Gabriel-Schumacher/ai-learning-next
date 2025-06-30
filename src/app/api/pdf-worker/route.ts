import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const exists = promisify(fs.exists);

// This route will serve the PDF.js worker from node_modules
export async function GET() {
  try {
    // Try multiple potential paths for the PDF.js worker
    const potentialPaths = [
      // Standard path
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js'),
      // ESM path
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
      // Legacy path
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js'),
      // Webpack path
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'webpack', 'pdf.worker.js'),
      // Minified version
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
    ];

    // Find the first path that exists
    let workerPath = null;
    for (const potentialPath of potentialPaths) {
      if (await exists(potentialPath)) {
        workerPath = potentialPath;
        break;
      }
    }

    if (!workerPath) {
      console.error('Could not find PDF.js worker file in any expected location');
      // Return a redirect to a CDN version as fallback
      return NextResponse.redirect(
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/pdf.worker.min.js'
      );
    }

    const workerContent = fs.readFileSync(workerPath, 'utf8');
    
    return new NextResponse(workerContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400'
      },
    });
  } catch (error) {
    console.error('Error serving PDF.js worker:', error);
    
    // Return a redirect to a CDN version as fallback
    return NextResponse.redirect(
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/pdf.worker.min.js'
    );
  }
}
