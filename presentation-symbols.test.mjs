import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';

async function htmlFiles(directory){
  const entries=await readdir(directory,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const path=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
    if(entry.isDirectory())files.push(...await htmlFiles(path));
    else if(entry.name.endsWith('.html'))files.push(path);
  }
  return files;
}

test('outward arrows request text presentation instead of emoji presentation',async()=>{
  const files=await htmlFiles(new URL('./dist/',import.meta.url));
  for(const file of files){
    const html=await readFile(file,'utf8');
    assert.doesNotMatch(html,/↗(?!\uFE0E)/u,file.pathname);
  }
});
