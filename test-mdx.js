const Markdown = require('markdown-to-jsx').compiler;
const md = "```bash\necho test\n```";
console.log(Markdown(md));
