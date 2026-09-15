import {clamp,smooth,storyFrame,settleTarget} from './story-model.mjs';
import {ScrollFilm} from './film-controller.mjs';
import {films} from './film-manifest.mjs';
const root=document.documentElement,story=document.querySelector('.story');
const scenes=[...document.querySelectorAll('.scene')],controls=document.querySelector('.story-controls');
const chapterLinks=[...document.querySelectorAll('.chapter-links a')],toggle=document.querySelector('.motion-toggle');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const film=new ScrollFilm(document.querySelector('.story-stage'),films,()=>requestRender());
let motion=false,paused=false,top=0,distance=1,progress=0,lastY=scrollY,direction=0,frameRequest=0,settleTimer=0,animation=0,navigating=false,pointerDown=false,lastInput='pointer';
const supportsMotion=()=>!reduce.matches&&innerHeight>=420&&innerWidth>=360;
const measure=()=>{top=story.getBoundingClientRect().top+scrollY;distance=Math.max(1,story.offsetHeight-innerHeight);};
function cancelMovement(){cancelAnimationFrame(animation);animation=0;navigating=false;clearTimeout(settleTimer);root.style.scrollBehavior='';}
function animateTo(destination,duration=520,finish){
  cancelMovement();root.style.scrollBehavior='auto';const start=scrollY,delta=destination-start,began=performance.now();navigating=true;
  const step=(now)=>{const t=clamp((now-began)/duration);window.scrollTo(0,start+delta*smooth(t));if(t<1)animation=requestAnimationFrame(step);else{animation=0;navigating=false;root.style.scrollBehavior='';finish?.();}};
  if(reduce.matches||Math.abs(delta)<2){window.scrollTo(0,destination);navigating=false;root.style.scrollBehavior='';finish?.();}else animation=requestAnimationFrame(step);
}
function render(){
  frameRequest=0;if(!motion)return;
  progress=clamp((scrollY-top)/distance*3,0,3);const state=storyFrame(progress);const filmState=film.update(state,motion);
  scenes.forEach((scene,index)=>{
    const isFrom=index===state.from,isTo=index===state.to&&state.to!==state.from;
    const visible=isFrom||isTo;const active=index===state.active;
    scene.classList.toggle('is-current',active);scene.classList.toggle('is-transitioning',visible&&!active);
    scene.style.opacity=String(isTo?state.blend:isFrom?1:0);scene.style.zIndex=String(isTo?2:1);
    scene.inert=!active;scene.setAttribute('aria-hidden',String(!active));
    if(!visible)return;
    const art=scene.querySelector('.scene-art'),copy=scene.querySelector('.scene-copy');
    const amount=isTo?1-state.blend:state.blend;
    art.style.transform=`translate3d(${isTo?amount*2:-amount*2}%,0,0) scale(${1+amount*.035})`;
    const copyVisible=isTo?smooth((state.blend-.76)/.24):1-smooth(state.blend/.24);
    copy.style.opacity=String(filmState.active&&!filmState.atTarget?0:copyVisible);copy.style.transform=`translate3d(0,${(1-copyVisible)*10}px,0)`;
  });
  chapterLinks.forEach((link,index)=>{if(index===state.active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  const next=scenes[Math.min(state.active+1,3)].querySelector('img');next.loading='eager';
  controls.classList.toggle('at-end',state.active===3);
  const cue=controls.querySelector('.scroll-cue');cue.firstChild.textContent=state.active===3?'Keep exploring ':'Scroll to explore ';
}
function requestRender(){if(!frameRequest)frameRequest=requestAnimationFrame(render);}
function setMode(){
  const previous=motion;motion=supportsMotion()&&!paused;cancelMovement();root.classList.toggle('is-motion',motion);root.classList.toggle('is-static',paused&&!reduce.matches);
  controls.hidden=!motion&&!paused;toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));
  if(!motion){film.disable();scenes.forEach(scene=>{scene.removeAttribute('aria-hidden');scene.inert=false;scene.style.opacity='';scene.style.zIndex='';scene.querySelector('.scene-art').style.transform='';scene.querySelector('.scene-copy').style.opacity='';scene.querySelector('.scene-copy').style.transform='';});}
  measure();
  if(previous!==motion&&document.readyState==='complete'&&scrollY<story.offsetHeight+top){
    const active=storyFrame(progress).active;
    window.scrollTo(0,motion?top+active/3*distance:scenes[active].getBoundingClientRect().top+scrollY);
  }
  requestRender();
}
function destinationFor(target){const index=scenes.indexOf(target);return motion&&index>=0?top+index/3*distance:Math.max(0,target.getBoundingClientRect().top+scrollY-(index<0?105:0));}
function goTo(target,focus=false){animateTo(destinationFor(target),560,()=>{if(focus){if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link)return;const id=decodeURIComponent(link.hash.slice(1)),target=document.getElementById(id);if(!target)return;
  event.preventDefault();cancelMovement();history.pushState(null,'',link.hash);goTo(target,!scenes.includes(target));
});
chapterLinks.forEach((link,index)=>link.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?3:clamp(index+(event.key==='ArrowRight'?1:-1),0,3);
  chapterLinks[next].focus();goTo(scenes[next]);
}));
toggle.addEventListener('click',()=>{paused=!paused;setMode();toggle.focus({preventScroll:true});});
function scheduleSettle(){
  clearTimeout(settleTimer);if(!motion||navigating||pointerDown||scrollY<=top||scrollY>=top+distance)return;
  settleTimer=setTimeout(()=>{if(!motion||navigating||pointerDown||(lastInput==='keyboard'&&document.activeElement?.closest('a,button,input,textarea,select,summary')))return;const snap=settleTarget(progress,direction);if(snap!==null)animateTo(top+snap/3*distance,380);},240);
}
addEventListener('scroll',()=>{
  const delta=scrollY-lastY;if(Math.abs(delta)>.5)direction=Math.sign(delta);lastY=scrollY;requestRender();scheduleSettle();
},{passive:true});
addEventListener('wheel',()=>{lastInput='pointer';cancelMovement();},{passive:true});
addEventListener('touchstart',()=>{lastInput='pointer';pointerDown=true;cancelMovement();},{passive:true});
addEventListener('touchend',()=>{pointerDown=false;scheduleSettle();},{passive:true});
addEventListener('touchcancel',()=>{pointerDown=false;scheduleSettle();},{passive:true});
addEventListener('pointerdown',()=>{lastInput='pointer';pointerDown=true;cancelMovement();},{passive:true});
addEventListener('pointerup',()=>{pointerDown=false;scheduleSettle();},{passive:true});
addEventListener('pointercancel',()=>{pointerDown=false;scheduleSettle();},{passive:true});
addEventListener('keydown',event=>{lastInput='keyboard';if(['Tab','Escape','PageDown','PageUp','ArrowDown','ArrowUp',' ','Home','End'].includes(event.key))cancelMovement();});
addEventListener('hashchange',()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)goTo(target);});
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setMode,100);},{passive:true});
reduce.addEventListener('change',()=>{paused=false;setMode();});
addEventListener('pageshow',()=>{measure();requestRender();});
setMode();
addEventListener('load',()=>{measure();const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)window.scrollTo(0,destinationFor(target));requestRender();},{once:true});
