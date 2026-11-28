// Copies the blog posts rendered by site.html's script into the static HTML,
// so readers without JavaScript (search engines, recruiter tools) see them.
// Run after editing POSTS:  node scripts/prerender-blog.js
const fs = require('fs'), path = require('path'), {chromium} = require('playwright');
const file = path.join(__dirname, '..', 'public', 'site.html');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + file);
  const html = await p.$eval('#posts', el => el.innerHTML);
  await b.close();
  const src = fs.readFileSync(file, 'utf8');
  const re = /<div class="posts" id="posts">[\s\S]*?<\/div><!--\/posts-->|<div class="posts" id="posts"><\/div>/;
  if (!re.test(src)) throw new Error('posts container not found');
  fs.writeFileSync(file, src.replace(re, () => '<div class="posts" id="posts">' + html + '</div><!--/posts-->'));
  console.log('prerendered', (html.match(/<details/g) || []).length, 'posts');
})();
