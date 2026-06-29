const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'assets');
const outputDir = path.join(__dirname, 'assets'); // Same dir

const filesToOptimize = [
    { name: 'uncu.png', width: 250 },
    { name: 'pututu.png', width: 250 },
    { name: 'chuspa.png', width: 250 },
    { name: 'q\'epi.png', width: 250 },
    { name: 'ullu.png', width: 250 },
    { name: 'usutas.png', width: 250 },
    { name: 'chasqui completo.png', width: 800 } // Keep this one slightly larger for the final modal
];

async function optimizeImages() {
    for (const file of filesToOptimize) {
        const files = fs.readdirSync(inputDir);
        const actualFile = files.find(f => f.toLowerCase() === file.name.toLowerCase());
        
        if (!actualFile) {
            console.log(`Missing file: ${file.name}`);
            continue;
        }

        const inputPath = path.join(inputDir, actualFile);
        const outputName = file.name.replace('.png', '').replace("'", '').replace(' ', '_').toLowerCase() + '.webp';
        const outputPath = path.join(outputDir, outputName);

        try {
            await sharp(inputPath)
                .resize({ width: file.width }) // Resize to a sensible width, auto height
                .webp({ quality: 80 }) // High quality WebP
                .toFile(outputPath);
            console.log(`Optimized ${actualFile} -> ${outputName}`);
        } catch (err) {
            console.error(`Error optimizing ${actualFile}:`, err);
        }
    }
}

optimizeImages();
