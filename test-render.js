const fs = require('fs');
const Babel = require('@babel/standalone');

// Read the markdown content
const content = fs.readFileSync('Resource/Writeup/dustyalleys-http-1-0.md', 'utf8');

// The markdown-to-jsx is a bit tricky to run in node because it requires React.
// But we can check if it throws an error.
console.log("Markdown parsing would happen client side, but we know the content is:", content.substring(0, 50));
