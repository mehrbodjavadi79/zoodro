const favicons = require('favicons');
const fs = require('fs');
const path = require('path');

// Source SVG file
const source = path.resolve(__dirname, 'public/zoodro_logo.svg'); 

// Configuration
const configuration = {
  path: '/', // Path for overriding default icons path
  appName: 'Zoodro', // Your application's name
  appShortName: 'Zoodro', // Your application's short name
  appDescription: 'Zoodro - Discounts on a Map', // Your application's description
  developerName: 'Zoodro Team', // Your (or your developer's) name
  developerURL: null, // Your (or your developer's) URL
  icons: {
    android: true, // Generate Android icons
    appleIcon: true, // Generate Apple touch icons
    appleStartup: false, // Generate Apple startup images
    favicons: true, // Generate regular favicons
    windows: false, // Generate Windows 8 tile icons
    yandex: false, // Generate Yandex browser icon
  }
};

// Generate icons
const generateIcons = async () => {
  try {
    const response = await favicons(source, configuration);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(path.resolve(__dirname, 'public/icons'))) {
      fs.mkdirSync(path.resolve(__dirname, 'public/icons'));
    }
    
    // Write the generated files to disk
    for (const image of response.images) {
      // Handle favicon.ico separately
      if (image.name === 'favicon.ico') {
        fs.writeFileSync(
          path.resolve(__dirname, `public/${image.name}`),
          image.contents
        );
      } else if (image.name === 'apple-touch-icon.png') {
        // Rename apple-touch-icon.png to logo192.png
        fs.writeFileSync(
          path.resolve(__dirname, 'public/logo192.png'),
          image.contents
        );
      } else if (image.name === 'android-chrome-512x512.png') {
        // Use android-chrome-512x512.png as logo512.png
        fs.writeFileSync(
          path.resolve(__dirname, 'public/logo512.png'),
          image.contents
        );
      } else {
        // Save other icons to the icons directory
        fs.writeFileSync(
          path.resolve(__dirname, `public/icons/${image.name}`),
          image.contents
        );
      }
    }
    
    console.log('Favicon generation completed!');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
};

generateIcons(); 