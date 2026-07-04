const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (filePath.endsWith('.md')) results.push(filePath);
    }
  });
  return results;
}

function extractHeadings(markdown) {
  const headings = [];
  const regex = /^(#{1,2})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const text = match[2].trim();
    // Replicate our custom slugify in reading.html
    const id = 's-' + encodeURIComponent(text.replace(/\s+/g, '-').toLowerCase());
    headings.push({
      level: match[1].length,
      id: id,
      text: text
    });
  }
  return headings;
}

async function build() {
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    console.error("public directory not found. Make sure deploy.yml copies files first.");
    process.exit(1);
  }

  // 1. Parse Markdown files
  const resourceDir = path.join(__dirname, '../Resource');
  const mdFiles = fs.existsSync(resourceDir) ? walkDir(resourceDir) : [];
  
  const posts = [];

  const readingTemplatePath = path.join(publicDir, 'reading.html');
  let readingTemplate = fs.existsSync(readingTemplatePath) ? fs.readFileSync(readingTemplatePath, 'utf8') : '';

  for (const file of mdFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = fm(content);
    const headings = extractHeadings(parsed.body);
    
    // Create TOC array for React
    const tocArray = headings.map(h => {
      return `{id:"${h.id}", label:"${h.text}", sub:${h.level > 2}}`;
    }).join(',');

    const attr = parsed.attributes;
    const isBlog = file.includes('Research');
    const slug = path.basename(file, '.md');
    
    posts.push({
      slug,
      isBlog,
      title: attr.title || 'Untitled',
      description: attr.description || '',
      date: attr.date || '2026.01.01',
      author: attr.author || 'admin@ckn',
      categoryEn: attr.categoryEn || 'WEB',
      categoryJp: attr.categoryJp || 'アクション',
      difficulty: attr.difficulty || 'mid', // easy, mid, hard
      tags: attr.tags || ['ctf'],
      hot: attr.hot || false,
      cover: attr.cover || ''
    });

    if (readingTemplate) {
      let pageHtml = readingTemplate;
      
      // Replace Title
      pageHtml = pageHtml.replace(/<h1 className="title"[^>]*>.*?<\/h1>/s, `<h1 className="title" id="s-top" data-toc>${attr.title || 'Untitled'}</h1>`);
      
      // Replace Byline
      pageHtml = pageHtml.replace(/<div className="byline">.*?<\/div>/s, 
        `<div className="byline">
          <b>${attr.author || 'admin@ckn'}</b><span style={{opacity:.5}}>·</span><span>${attr.date || '2026.01.01'}</span>
        </div>`
      );

      // Replace Tags
      const tagsHtml = (attr.tags || ['ctf']).map(t => `<Tag>${t}</Tag>`).join('');
      pageHtml = pageHtml.replace(/<div className="tags">.*?<\/div>/s, `<div className="tags">${tagsHtml}</div>`);

      // Inject Markdown into RAW_POST
      pageHtml = pageHtml.replace(/const RAW_POST = "";/s, 
        `const RAW_POST = ${JSON.stringify(content)};`
      );

      // Replace TOC
      pageHtml = pageHtml.replace(/const TOC = \[.*?\];/s, `const TOC = [\n{id:"s-top", label:"${attr.title || 'Untitled'}"},\n${tocArray}\n];`);

      // Create directories if needed
      const outDir = path.join(publicDir, isBlog ? 'blog' : 'writeup');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      
      // Fix relative paths for the nested page
      pageHtml = pageHtml.replace(/href="index\.html"/g, 'href="../index.html"');
      pageHtml = pageHtml.replace(/href="\.\.\/\.\.\/styles\.css"/g, 'href="../styles.css"');
      pageHtml = pageHtml.replace(/src="\.\.\/\.\.\/_ds_bundle\.js"/g, 'src="../_ds_bundle.js"');
      pageHtml = pageHtml.replace(/href="styles\.css"/g, 'href="../styles.css"');
      pageHtml = pageHtml.replace(/src="_ds_bundle\.js"/g, 'src="../_ds_bundle.js"');

      fs.writeFileSync(path.join(outDir, `${slug}.html`), pageHtml);
    }
  }

  // 2. Update index.html
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // Generate BLOG array
    const blogPosts = posts.filter(p => p.isBlog);
    const blogArrayStr = blogPosts.map(p => {
      return `{chip:{jp:"論説",en:"BLOG"},chipInk:true,title:"${p.title}",meta:"${p.author} · ${p.date}",excerpt:"${p.description}",catEn:"${p.categoryEn}",catJp:"${p.categoryJp}",foot:"đọc tiếp ", href: "blog/${p.slug}.html"}`;
    }).join(',\n');
    
    // Generate WRITEUP array
    const writeupPosts = posts.filter(p => !p.isBlog);
    const writeupArrayStr = writeupPosts.map(p => {
      let d = "中";
      if (p.difficulty === 'hard') d = "難";
      if (p.difficulty === 'easy') d = "易";
      
      return `<Card chip={{jp:"連載",en:"CH.X"}} hanko={{jp:"${d}",en:"${p.difficulty.toUpperCase()}",tone:"${p.difficulty}"}} title="${p.title}" meta="${p.author} · ${p.categoryEn}" catEn="${p.categoryEn}" catJp="${p.categoryJp}" foot="READ " href="writeup/${p.slug}.html" />`;
    }).join('\n');

    if (blogArrayStr) {
      indexHtml = indexHtml.replace(/const BLOG = \[.*?\];/s, `const BLOG = [\n${blogArrayStr}\n];`);
    }

    if (writeupArrayStr) {
      // Find the ctf-split section and replace the Card there
      indexHtml = indexHtml.replace(/<Card chip=\{\{jp:"連載"[^>]*\/>/s, writeupArrayStr);
    }
    
    // Generate HERO object
    const hotPost = posts.find(p => p.hot) || posts[0];
    if (hotPost) {
      let d = "中"; let dc = "mid";
      if (hotPost.difficulty === 'hard') { d = "難"; dc = "hard"; }
      if (hotPost.difficulty === 'easy') { d = "易"; dc = "easy"; }
      const href = (hotPost.isBlog ? "blog/" : "writeup/") + hotPost.slug + ".html";
      const kicker = hotPost.isBlog ? "BLOG · RESEARCH" : "CH.X · CTF WRITEUP";
      const tagJp = hotPost.isBlog ? "論説" : "連載";
      const tagEn = hotPost.isBlog ? "BLOG" : "SERIAL";
      
      const heroStr = `const HERO = {
      tagJp: "${tagJp}",
      tagEn: "${tagEn}",
      kicker: "${kicker}",
      titleHtml: "${hotPost.title}",
      desc: "${hotPost.description.replace(/"/g, '\\"')}",
      tags: ${JSON.stringify(hotPost.tags)},
      href: "${href}",
      meta: "${hotPost.author} · ${hotPost.date}",
      vol: "VOL.01",
      sealJp: "${d}",
      sealEn: "${hotPost.difficulty.toUpperCase()}",
      sealTone: "${dc}",
      cover: "${hotPost.cover}"
    };`;
      indexHtml = indexHtml.replace(/const HERO = \{.*?\};/s, heroStr);
    }

    // 3. Update Checklist
    const checklistPath = path.join(__dirname, '../Resource/checklist.json');
    if (fs.existsSync(checklistPath)) {
      const cl = JSON.parse(fs.readFileSync(checklistPath, 'utf8'));
      const catsArray = JSON.stringify(cl.cats, null, 2);
      indexHtml = indexHtml.replace(/const CATS = \[.*?\];/s, `const CATS = ${catsArray};`);
      
      // Update stats
      indexHtml = indexHtml.replace(/<span className="v acc">\d+<\/span> flags/g, `<span className="v acc">${cl.stats.flags}</span> flags`);
      indexHtml = indexHtml.replace(/最強 <span className="v">.*?<\/span>/g, `最強 <span className="v">${cl.stats.best}</span>`);
      indexHtml = indexHtml.replace(/評価 <span className="v acc">.*?<\/span>/g, `評価 <span className="v acc">${cl.stats.rank}</span>`);
    }
    
    // IMPORTANT: Make the Card component accept href
    indexHtml = indexHtml.replace(/function Card\(\{([^}]+)\}\)\{/s, `function Card({$1, href}){`);
    indexHtml = indexHtml.replace(/<a className="ac-card">/s, `<a className="ac-card" href={href}>`);

    fs.writeFileSync(indexPath, indexHtml);
  }
  
  console.log("Build script completed successfully!");
}

build().catch(console.error);
