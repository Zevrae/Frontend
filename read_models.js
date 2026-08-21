import fs from 'fs';

const files = [
  'D:\\Backend-main\\Backend\\models\\Order.js',
  'D:\\Backend-main\\Backend\\models\\User.js'
];

files.forEach(file => {
  try {
    console.log(`\n======================================================`);
    console.log(`FILE: ${file}`);
    console.log(`======================================================`);
    const content = fs.readFileSync(file, 'utf8');
    console.log(content);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
});
