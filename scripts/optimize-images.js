const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const publicDir = path.join(__dirname, '../public')
const imageFiles = fs.readdirSync(publicDir).filter(file =>
    file.match(/^image\d+\.png$/i)
)

console.log(`Found ${imageFiles.length} PNG images to convert to JPG`)

imageFiles.forEach(file => {
    const filePath = path.join(publicDir, file)
    const stats = fs.statSync(filePath)
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2)

    console.log(`\nProcessing ${file} (${sizeInMB}MB)...`)

    try {
        const jpgFile = file.replace(/\.png$/i, '.jpg')
        const jpgPath = path.join(publicDir, jpgFile)

        // Convert PNG to JPG using ImageMagick
        try {
            execSync(`convert "${filePath}" -quality 85 -background white -alpha remove "${jpgPath}"`, { cwd: publicDir })
            console.log(`✓ Converted to JPG: ${jpgFile}`)
        } catch (error) {
            console.log(`✗ Failed to convert ${file} to JPG (is ImageMagick installed?)`)
        }
    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message)
    }
})

console.log('\nPNG to JPG conversion complete!')