import test from 'node:test';
import assert from 'node:assert/strict';
import {ScrollFilm} from './dist/film-controller.mjs';

class Element {
  constructor(){this.children=[];this.events={};const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)};}
  setAttribute(){} removeAttribute(name){delete this[name];} remove(){this.removed=true;} prepend(x){this.children.unshift(x);} append(x){this.children.push(x);}
  addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
  emit(name){for(const fn of this.events[name]??[])fn();}
}
class Video extends Element {
  constructor(){super();this.readyState=0;this.duration=NaN;this.seeking=false;this.time=0;this.seeks=[];}
  load(){} pause(){this.paused=true;} get currentTime(){return this.time;}
  set currentTime(value){assert.equal(this.seeking,false,'Overlapping decoder seeks');this.time=value;this.seeking=true;this.seeks.push(value);}
  loaded(){this.duration=8;this.readyState=2;this.emit('loadedmetadata');this.emit('loadeddata');}
  finishSeek(){this.seeking=false;this.emit('seeked');}
}
function setup(){
  const orientation={matches:false},stage=new Element();
  globalThis.document={createElement:tag=>tag==='video'?new Video():new Element()};
  globalThis.matchMedia=()=>orientation;
  globalThis.innerWidth=1440;globalThis.innerHeight=900;globalThis.devicePixelRatio=1;
  const film=new ScrollFilm(stage,{landscape:['pilot.mp4'],portrait:[]},()=>{});
  return {film,stage,orientation};
}
const frame=blend=>({from:0,to:1,blend});

test('disabled motion does not start a media download',()=>{
  const {film}=setup();assert.equal(film.update(frame(.5),false).active,false);assert.equal(film.entries.size,0);
});
test('a slow decoder receives the latest scroll destination without queued stale seeks',()=>{
  const {film,stage}=setup();film.update(frame(0),true);const entry=film.active;entry.video.loaded();
  film.update(frame(.25),true);assert.equal(entry.video.seeks.length,1);
  film.update(frame(.5),true);film.update(frame(.75),true);assert.equal(entry.video.seeks.length,1);
  entry.video.finishSeek();assert.equal(entry.video.seeks.length,2);assert.ok(Math.abs(entry.video.seeks[1]-.75*(8-1/24))<1e-6);
  entry.video.finishSeek();assert.equal(film.update(frame(.75),true).atTarget,true);assert.equal(stage.classList.contains('has-film'),true);
});
test('a failed movie exposes the illustrated fallback',()=>{
  const {film,stage}=setup();film.update(frame(0),true);film.active.video.loaded();film.update(frame(0),true);
  assert.equal(stage.classList.contains('has-film'),true);film.active.video.emit('error');
  assert.equal(film.update(frame(0),true).active,false);assert.equal(stage.classList.contains('has-film'),false);
});
test('portrait view never substitutes a landscape movie when its own movie is absent',()=>{
  const {film,orientation}=setup();orientation.matches=true;
  assert.equal(film.update(frame(.4),true).active,false);assert.equal(film.entries.size,0);
});

test('high-density displays select the native 4K delivery tier',()=>{
  const {film}=setup();film.manifest.landscape=[{standard:'2k.mp4',high:'4k.mp4'}];
  film.update(frame(0),true);assert.equal(film.active.video.src,'2k.mp4');
  globalThis.devicePixelRatio=2;film.update(frame(0),true);assert.equal(film.active.video.src,'4k.mp4');
});
test('moving through the story releases older video decoders',()=>{
  const {film}=setup();film.manifest.landscape=['one.mp4','two.mp4','three.mp4'];
  film.update(frame(0),true);const first=film.active;
  film.update({from:1,to:2,blend:0},true);film.update({from:2,to:3,blend:0},true);
  assert.equal(film.entries.size,2);assert.equal(first.video.removed,true);assert.equal(first.video.paused,true);
  assert.equal(first.video.src,undefined);assert.equal(film.active.video.src,'three.mp4');
});
