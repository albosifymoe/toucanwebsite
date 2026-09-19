// One-time, read-only import from the public WordPress archive. No generation.
import {readFile, writeFile, mkdir, access, copyFile} from 'node:fs/promises';
import path from 'node:path';
const posts=JSON.parse(await readFile(new URL('../planning/project-source-posts.json',import.meta.url),'utf8'));
const root=new URL('./dist/',import.meta.url);
const existing=JSON.parse(await readFile(new URL('../planning/project-cover-register.json',import.meta.url),'utf8'));
const jobs=new Map(), projects=[];
async function retrieve(url){
  for(let attempt=0;attempt<3;attempt++){
    try{const response=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(`${response.status}: ${url}`);return response;}
    catch(error){if(attempt===2)throw Error(`Could not retrieve ${url}`,{cause:error});}
  }
}
function asset(url,width,height,preferred){
  if(!url.startsWith('https://toucan.ly/wp-content/uploads/'))throw Error(`Unexpected asset host: ${url}`);
  if(jobs.has(url))return jobs.get(url);
  const location=preferred||`assets/projects/${projects.length+1}-${jobs.size+1}${path.extname(new URL(url).pathname)}`;
  const item={src:location,width:Number(width),height:Number(height),source:url};
  jobs.set(url,item);return item;
}
await mkdir(new URL('assets/projects/',root),{recursive:true});
for(const post of posts){
  const media=post._embedded['wp:featuredmedia'][0];
  const cover=media.media_details.sizes.large||{source_url:media.source_url,...media.media_details};
  const old=existing.find(p=>p.url===post.link);
  const hero=asset(cover.source_url,cover.width,cover.height,old?`assets/${old.localFile}`:undefined);
  const gallery=[];
  for(const [tag] of post.content.rendered.matchAll(/<img\b[^>]+>/g)){
    const attrs=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
    if(!attrs.src?.startsWith('https://'))continue;
    let url=attrs.src,w=Number(attrs.width),h=Number(attrs.height);
    const smaller=attrs.srcset?.split(',').map(s=>s.trim().split(/\s+/)).find(([,size])=>size==='1024w');
    if(w>1024&&smaller){url=smaller[0];h=Math.round(h*1024/w);w=1024;}
    const item=asset(url,w,h);
    if(item.src!==hero.src&&!gallery.some(i=>i.src===item.src))gallery.push(item);
  }
  // Recover the comparison artwork from the broken WPBakery shortcodes.
  const ids=[...post.content.rendered.matchAll(/image(?:_2)?_url=&#8221;(\d+)&#8243;/g)].map(m=>m[1]);
  for(const id of [...new Set(ids)]){
    const response=await retrieve(`https://toucan.ly/wp-json/wp/v2/media/${id}`);
    if(!response.ok)throw Error(`Media ${id}: ${response.status}`);
    const media=await response.json();
    const image=media.media_details.sizes.large||{source_url:media.source_url,...media.media_details};
    gallery.push(asset(image.source_url,image.width,image.height));
  }
  projects.push({slug:post.slug,title:post.title.rendered,source:post.link,cover:hero,gallery});
}
const queue=[...jobs.values()];let downloaded=0;
await Promise.all(Array.from({length:6},async()=>{
  while(queue.length){
    const item=queue.shift(),target=new URL(item.src,root);
    try{await access(target);continue;}catch{}
    const archived=new URL(`../production/portfolio-originals/${path.basename(item.src)}`,import.meta.url);
    try{await access(archived);await copyFile(archived,target);continue;}catch{}
    const response=await retrieve(item.source);
    if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error(`${response.status}: ${item.source}`);
    await writeFile(target,Buffer.from(await response.arrayBuffer()));downloaded++;
  }
}));
await writeFile(new URL('./project-assets.json',import.meta.url),JSON.stringify(projects,null,2)+'\n');
console.log(JSON.stringify({projects:projects.length,assets:jobs.size,downloaded,galleries:projects.map(p=>({slug:p.slug,count:p.gallery.length}))},null,2));
