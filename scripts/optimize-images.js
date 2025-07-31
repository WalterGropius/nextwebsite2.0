const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const publicDir = path.join(__dirname, '../public')
const imageFiles = fs.readdirSync(publicDir).filter(file =>
    file.match(/^image\d+\.png$/i)
)

console.log(`Found ${imageFiles.length} image files to optimize`)

imageFiles.forEach(file => {
    const filePath = path.join(publicDir, file)
    const stats = fs.statSync(filePath)
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2)

    console.log(`\nProcessing ${file} (${sizeInMB}MB)...`)

    try {
        // Create optimized version with reduced quality
        const optimizedPath = path.join(publicDir, `optimized_${file}`)

        // Use ImageMagick if available, otherwise use sharp
        try {
            execSync(`convert "${filePath}" -quality 85 -strip "${optimizedPath}"`, { cwd: publicDir })
            console.log(`✓ Created optimized version: optimized_${file}`)
        } catch (error) {
            console.log(`⚠ ImageMagick not available, skipping ${file}`)
        }

        // Also create WebP version for better compression
        try {
            const webpPath = path.join(publicDir, file.replace('.png', '.webp'))
            execSync(`convert "${filePath}" -quality 85 "${webpPath}"`, { cwd: publicDir })
            console.log(`✓ Created WebP version: ${file.replace('.png', '.webp')}`)
        } catch (error) {
            console.log(`⚠ Could not create WebP version for ${file}`)
        }

    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message)
    }
})

console.log('\nImage optimization complete!')
console.log('\nRecommendations:')
console.log('1. Replace original PNG files with optimized versions')
console.log('2. Use WebP format for better compression')
console.log('3. Consider implementing lazy loading for images')
console.log('4. Use responsive images with different sizes') 