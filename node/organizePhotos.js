var ExifImage = require('exif').ExifImage;
const { mkdirSync, readdirSync, existsSync, renameSync } = require('fs');

const images = readdirSync('./resources').filter(obj => obj.indexOf('.jpg') !== -1).map(img => `resources/${img}`);

for (image of images) {
  try {
    new ExifImage({ image }, function (error, exifData) {
      if (!error) {
        const filename = image.split('/').pop();
        console.log(filename);
        // get new dir name
        const dir = './resources/' + exifData.image.ModifyDate.substr(0, 7).replace(/:/g, '-');
        if (!existsSync(`${dir}`)) {
          mkdirSync(dir);
        }
        renameSync(image, `${dir}/${filename}`)
      } else {
        console.warn(error.source + ' ' + error.message);
      }
    });
  } catch (error) {
    console.log('Error: ' + error.message);
  }
}
