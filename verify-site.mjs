import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4174';
const routes=JSON.parse(await readFile(new URL('./page-routes.json',import.meta.url),'utf8'));
const documents=new Map(),resources=new Set(),errors=[];
for(const route of routes){
  const response=await fetch(base+route);
  assert.equal(response.status,200,route);
  const html=await response.text();documents.set(route,html);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${route}: one main heading`);
  assert.ok(html.includes('name="robots" content="noindex,nofollow"'),`${route}: private preview`);
  for(const [,value] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const resolved=new URL(value,base+route);
    if(resolved.origin!==base)continue;
    resources.add(resolved.pathname);
  }
}
for(const [route,html] of documents){
  for(const [,value] of html.matchAll(/href="([^"]*#[^"]+)"/g)){
    const resolved=new URL(value,base+route);
    if(resolved.origin!==base||!resolved.hash)continue;
    const target=documents.get(resolved.pathname);
    if(target&&!target.includes(`id="${decodeURIComponent(resolved.hash.slice(1))}"`))errors.push(`${route}: missing anchor ${value}`);
  }
}
const queue=[...resources];
await Promise.all(Array.from({length:8},async()=>{
  while(queue.length){const route=queue.shift();const response=await fetch(base+route,{method:'HEAD'});if(response.status!==200)errors.push(`${response.status}: ${route}`);}
}));
const report={checkedAt:new Date().toISOString(),base,pages:documents.size,internalResources:resources.size,errors};
await writeFile(new URL('../planning/inner-pages-link-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
assert.equal(errors.length,0,'Internal links and assets must resolve');
