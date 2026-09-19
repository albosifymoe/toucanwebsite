import test from 'node:test';
import assert from 'node:assert/strict';
import {ScrollFilm} from './dist/film-controller.mjs';
class Element {
  constructor(){this.children=[];this.events={};const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)};}
  setAttribute(){} removeAttribute(name){delete this[name];} remove(){this.removed=true;} prepend(x){this.children.unshift(x);} append(x){this.children.push(x);}
  addEventListener(name,fn){(this.events[name]??=[]).push(fn);} emit(name){for(const fn of this.events[name]??[])fn();}
}
class Video extends Element {
  constructor(){super();this.readyState=0;this.duration=NaN;this.seeking=false;this.time=0;this.seeks=[];}
  load(){} pause(){this.paused=true;} get currentTime(){return this.time;}
  set currentTime(value){assert.equal(this.seeking,false,'overlapping decoder seeks');this.time=value;this.seeking=true;this.readyState=1;this.seeks.push(value);}
  loaded(){this.duration=193/24;this.readyState=2;this.emit('loadedmetadata');this.emit('loadeddata');}
  finishSeek(){this.seeking=false;this.readyState=2;this.emit('seeked');}
}
function setup(manifest={landscape:['one.mp4'],portrait:[]}){
  const orientation={matches:false},stage=new Element();let callbacks=0;
  globalThis.document={createElement:tag=>tag==='video'?new Video():new Element()};globalThis.matchMedia=()=>orientation;
  globalThis.innerWidth=1440;globalThis.innerHeight=900;globalThis.devicePixelRatio=1;
  const film=new ScrollFilm(stage,manifest,()=>callbacks++);return {film,stage,orientation,callbacks:()=>callbacks};
}
const frame=(amount,passage=0)=>({passage,amount,settled:false,scene:null});
test('disabled motion starts no downloads and releases existing decoders',()=>{
  const {film}=setup();film.update(frame(.5),false);assert.equal(film.entries.size,0);
  film.update(frame(0),true);const video=film.active.video;film.disable();assert.equal(video.removed,true);assert.equal(film.entries.size,0);
});
test('cold clip becomes visible after a completed frame even while the target moves',()=>{
  const {film,stage}=setup();film.update(frame(.2),true);const entry=film.active;entry.video.loaded();
  film.update(frame(.4),true);assert.equal(stage.classList.contains('has-film'),false);
  entry.video.finishSeek(); // completes .2, while latest target is .4
  assert.equal(stage.classList.contains('has-film'),true);assert.equal(entry.video.hidden,false);
  film.update(frame(.6),true);assert.equal(entry.video.seeks.length,2);
  assert.equal(stage.classList.contains('has-film'),true,'new seek must not hide an already decoded frame');
  entry.video.finishSeek();film.update(frame(.6),true);assert.equal(Math.floor(film.active.decodedTime*24),115);
});
test('latest target wins without overlapping decoder requests',()=>{
  const {film}=setup();film.update(frame(0),true);const e=film.active;e.video.loaded();
  film.update(frame(.25),true);film.update(frame(.5),true);film.update(frame(.75),true);assert.equal(e.video.seeks.length,1);
  e.video.finishSeek();film.update(frame(.75),true);assert.equal(Math.floor(e.video.seeks.at(-1)*24),144);
  e.video.finishSeek();assert.equal(film.update(frame(.75),true).atTarget,true);
});
test('future passage is prepared before crossing its boundary',()=>{
  const {film}=setup({landscape:['one.mp4','two.mp4','three.mp4']});film.update(frame(0),true);film.active.video.loaded();film.update(frame(0),true);
  assert.equal(film.entries.has('two.mp4'),true);assert.equal(film.entries.get('two.mp4').video.hidden,true);
});
test('outgoing frame stays visible until incoming clip has decoded, including a skipped chapter',()=>{
  const {film}=setup({landscape:['one.mp4','two.mp4','three.mp4']});film.update(frame(0),true);const first=film.active;first.video.loaded();film.update(frame(0),true);
  film.update(frame(.5,2),true);assert.equal(first.video.hidden,false);assert.equal(film.presented,first);assert.equal(film.entries.size,2);
  const third=film.active;third.video.loaded();assert.equal(film.presented,first);third.video.finishSeek();assert.equal(film.presented,third);assert.equal(first.video.hidden,true);
});
test('late events from an evicted clip cannot re-enable the layer',()=>{
  const {film,stage,callbacks}=setup({landscape:['one.mp4','two.mp4','three.mp4']});film.update(frame(0),true);const old=film.active;
  film.update(frame(0,1),true);film.update(frame(0,2),true);assert.equal(old.disposed,true);
  const count=callbacks();old.video.loaded();old.video.finishSeek();old.video.emit('error');assert.equal(callbacks(),count);assert.equal(stage.classList.contains('has-film'),false);
});
test('matching endpoint at a reading hold does not swap to another movie',()=>{
  const {film}=setup({landscape:['one.mp4','two.mp4','three.mp4']});film.update(frame(1),true);film.active.video.loaded();film.active.video.finishSeek();
  const state={settled:true,scene:1,passage:1,amount:0};const r=film.update(state,true);
  assert.equal(film.active.url,'one.mp4');assert.equal(r.sceneReady,true);assert.equal(film.entries.has('two.mp4'),true);
});
test('media errors reveal the still fallback; missing portrait never substitutes landscape',()=>{
  const {film,stage,orientation}=setup();film.update(frame(0),true);film.active.video.loaded();film.active.video.emit('error');
  assert.equal(film.update(frame(0),true).failed,true);assert.equal(stage.classList.contains('has-film'),false);
  orientation.matches=true;assert.equal(film.update(frame(.5),true).active,false);
});
test('high-density delivery selects the native 4K movie',()=>{
  const {film}=setup({landscape:[{standard:'2k.mp4',high:'4k.mp4'}]});film.update(frame(0),true);assert.equal(film.active.url,'2k.mp4');
  globalThis.devicePixelRatio=2;film.update(frame(0),true);assert.equal(film.active.url,'4k.mp4');
});
