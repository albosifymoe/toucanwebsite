import {clamp,smooth,storyFrame,STORY_LENGTH,chapterPositions,supportsStoryMotion} from './story-model.mjs';
import {ScrollFilm} from './film-controller.mjs';
import {films} from './film-manifest.mjs';
const root=document.documentElement,story=document.querySelector('.story'),stage=document.querySelector('.story-stage');
const scenes=[...document.querySelectorAll('.scene')],controls=document.querySelector('.story-controls');
const chapterLinks=[...document.querySelectorAll('.chapter-links a')],toggle=document.querySelector('.motion-toggle');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),film=new ScrollFilm(stage,films,()=>requestRender());
let motion=false,paused=false,top=0,distance=1,progress=0,lastY=scrollY,direction=1,frameRequest=0,animation=0,jumpTimer=0;
const supportsMotion=()=>supportsStoryMotion(reduce.matches,innerWidth,innerHeight);
const measure=()=>{top=story.getBoundingClientRect().top+scrollY;distance=Math.max(1,story.offsetHeight-innerHeight);};
const position=()=>clamp((scrollY-top)/distance*STORY_LENGTH,0,STORY_LENGTH),yFor=unit=>top+unit/STORY_LENGTH*distance;
function cancelMovement(){cancelAnimationFrame(animation);animation=0;clearTimeout(jumpTimer);stage.classList.remove('is-jumping');root.style.scrollBehavior='';}
function animateTo(destination,duration=520,finish,linear=false){
  cancelMovement();root.style.scrollBehavior='auto';const start=scrollY,delta=destination-start,began=performance.now();
  const step=now=>{const t=clamp((now-began)/duration);window.scrollTo(0,start+delta*(linear?t:smooth(t)));if(t<1)animation=requestAnimationFrame(step);else{animation=0;root.style.scrollBehavior='';finish?.();}};
  if(reduce.matches||Math.abs(delta)<2||duration===0){window.scrollTo({top:destination,behavior:'instant'});root.style.scrollBehavior='';finish?.();}else animation=requestAnimationFrame(step);
}
function render(){
  frameRequest=0;if(!motion)return;
  progress=position();const state=storyFrame(progress),filmState=film.update(state,true,direction),readable=filmState.failed||(state.settled&&(filmState.sceneReady||!filmState.active));
  scenes.forEach((scene,index)=>{
    const active=index===state.active,showCopy=active&&readable;
    scene.classList.toggle('is-current',active);scene.classList.remove('is-transitioning');scene.style.opacity=active?'1':'0';scene.style.zIndex='1';
    scene.inert=!showCopy;scene.setAttribute('aria-hidden',String(!showCopy));scene.querySelector('.scene-art').style.transform='';
    const copy=scene.querySelector('.scene-copy');copy.style.opacity=showCopy?'1':'0';copy.style.transform=showCopy?'none':'translate3d(0,8px,0)';
  });
  chapterLinks.forEach((link,index)=>{if(index===state.active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  scenes[Math.min(state.active+1,3)].querySelector('img').loading='eager';controls.classList.toggle('at-end',state.active===3);
  controls.querySelector('.scroll-cue').firstChild.textContent=state.active===3?'Keep exploring ':'Scroll to explore ';
}
function requestRender(){if(!frameRequest)frameRequest=requestAnimationFrame(render);}
function setMode(){
  const previous=motion,oldPosition=progress,wasInStory=scrollY>=top&&scrollY<=top+distance;
  motion=supportsMotion()&&!paused;cancelMovement();root.classList.toggle('is-motion',motion);root.classList.toggle('is-static',paused&&!reduce.matches);
  story.style.setProperty('--story-height',`${(STORY_LENGTH+1)*100}svh`);
  controls.hidden=!motion&&!paused;toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));
  if(!motion){film.disable();scenes.forEach(scene=>{scene.removeAttribute('aria-hidden');scene.inert=false;scene.style.opacity='';scene.style.zIndex='';scene.querySelector('.scene-art').style.transform='';scene.querySelector('.scene-copy').style.opacity='';scene.querySelector('.scene-copy').style.transform='';});}
  measure();
  if(document.readyState==='complete'&&wasInStory){const active=storyFrame(oldPosition).active;if(previous!==motion)window.scrollTo({top:motion?yFor(chapterPositions[active]):scenes[active].getBoundingClientRect().top+scrollY,behavior:'instant'});else if(motion)window.scrollTo({top:yFor(oldPosition),behavior:'instant'});}
  lastY=scrollY;requestRender();
}
function destinationFor(target){const index=scenes.indexOf(target);return motion&&index>=0?yFor(chapterPositions[index]):Math.max(0,target.getBoundingClientRect().top+scrollY-(index<0?105:0));}
function goTo(target,focus=false){
  const index=scenes.indexOf(target),destination=destinationFor(target);
  const finish=()=>{if(focus){if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}};
  if(motion&&index>=0){const current=storyFrame(position()),inside=scrollY>=top&&scrollY<=top+distance;
    if(inside&&Math.abs(index-current.active)<=1)animateTo(destination,Math.min(6500,Math.abs(chapterPositions[index]-position())*2100),finish,true);
    else{cancelMovement();stage.classList.add('is-jumping');jumpTimer=setTimeout(()=>{film.clearPresentation();window.scrollTo({top:destination,behavior:'instant'});requestRender();stage.classList.remove('is-jumping');finish();},140);}
  }else animateTo(destination,520,finish);
}
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const target=document.getElementById(decodeURIComponent(link.hash.slice(1)));if(!target)return;event.preventDefault();history.pushState(null,'',link.hash);goTo(target,!scenes.includes(target));});
chapterLinks.forEach((link,index)=>link.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?3:clamp(index+(event.key==='ArrowRight'?1:-1),0,3);chapterLinks[next].focus();goTo(scenes[next]);}));
toggle.addEventListener('click',()=>{paused=!paused;setMode();toggle.focus({preventScroll:true});});
addEventListener('scroll',()=>{const delta=scrollY-lastY;if(Math.abs(delta)>.5)direction=Math.sign(delta);lastY=scrollY;requestRender();},{passive:true});
for(const type of ['wheel','touchstart','pointerdown'])addEventListener(type,cancelMovement,{passive:true});
addEventListener('keydown',event=>{if(!event.defaultPrevented&&['Tab','Escape','PageDown','PageUp','ArrowDown','ArrowUp',' ','Home','End'].includes(event.key))cancelMovement();});
addEventListener('hashchange',()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)goTo(target);});
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setMode,100);},{passive:true});
reduce.addEventListener('change',()=>{paused=false;setMode();});addEventListener('pageshow',()=>{measure();requestRender();});setMode();
addEventListener('load',()=>{measure();const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)window.scrollTo({top:destinationFor(target),behavior:'instant'});requestRender();},{once:true});
