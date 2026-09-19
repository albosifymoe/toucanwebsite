const FRAME=1/24;
const close=(a,b)=>Math.abs(a-b)<FRAME*.8;
// A completed frame remains presentable while another seek is in flight.
export class ScrollFilm {
  constructor(stage,manifest,onFrame){
    this.stage=stage;this.manifest=manifest;this.onFrame=onFrame;
    this.entries=new Map();this.active=null;this.presented=null;this.enabled=false;this.family=null;
    this.layer=document.createElement('div');this.layer.className='motion-film';this.layer.setAttribute('aria-hidden','true');stage.prepend(this.layer);
    this.portrait=matchMedia('(max-width: 900px) and (orientation: portrait)');
  }
  dispose(entry){
    entry.disposed=true;entry.video.pause();entry.video.removeAttribute('src');entry.video.load();entry.video.remove();this.entries.delete(entry.url);
    if(this.presented===entry)this.clearPresentation();
  }
  entryFor(url,index){
    if(this.entries.has(url))return this.entries.get(url);
    if(this.entries.size>=2){const spare=[...this.entries.values()].find(entry=>entry!==this.presented);if(spare)this.dispose(spare);}
    const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';video.tabIndex=-1;video.setAttribute('aria-hidden','true');video.hidden=true;
    const entry={url,index,video,failed:false,decoded:false,decodedTime:0,amount:0,target:0,disposed:false};
    this.entries.set(url,entry);this.layer.append(video);
    video.addEventListener('error',()=>{if(entry.disposed)return;entry.failed=true;if(this.active===entry)this.clearPresentation();this.onFrame();});
    video.addEventListener('loadedmetadata',()=>{if(!entry.disposed){this.setTarget(entry);this.seek(entry);}});
    const decoded=fromSeek=>{
      if(entry.disposed||entry.failed||video.seeking||video.readyState<2)return;
      entry.decoded=true;entry.decodedTime=video.currentTime;
      // Publish this completed seek before a newer destination can reset readiness.
      if(this.enabled&&this.active===entry&&(fromSeek||close(entry.decodedTime,entry.target)))this.present(entry);
      this.onFrame();
    };
    video.addEventListener('loadeddata',()=>decoded(false));video.addEventListener('seeked',()=>decoded(true));
    video.src=url;video.load();return entry;
  }
  setTarget(entry){
    const duration=entry.video.duration;
    if(Number.isFinite(duration)){
      const frame=Math.round(entry.amount*Math.max(0,duration-FRAME)/FRAME);
      // Seek inside the frame. Exact 1/24 boundaries can round down in the media
      // timebase and repeatedly display the preceding frame instead.
      entry.target=Math.min(Math.max(0,duration-.001),frame*FRAME+(frame? .001:0));
    }
  }
  present(entry){
    if(entry.disposed||entry.failed||!this.enabled||this.active!==entry)return;
    for(const item of this.entries.values())item.video.hidden=item!==entry;
    this.presented=entry;this.stage.classList.add('has-film');
  }
  seek(entry){
    const video=entry.video;
    if(entry.disposed||entry.failed||video.readyState<1||video.seeking||!Number.isFinite(video.duration))return;
    if(!close(video.currentTime,entry.target)){try{video.currentTime=entry.target;}catch{entry.failed=true;if(this.active===entry)this.clearPresentation();}}
  }
  clearPresentation(){this.stage.classList.remove('has-film');for(const entry of this.entries.values())entry.video.hidden=true;this.presented=null;}
  update(state,enabled,direction=1){
    const family=this.portrait.matches?'portrait':'landscape',ratio=family==='portrait'?9/16:16/9;
    const drawnWidth=Math.max(innerWidth,innerHeight*ratio),drawnHeight=drawnWidth/ratio;
    const tier=Math.max(drawnWidth,drawnHeight)*(globalThis.devicePixelRatio||1)>2304?'high':'standard';
    const urlFor=index=>{const spec=this.manifest[family]?.[index];return typeof spec==='string'?spec:spec?.[tier];};
    if(!enabled||globalThis.navigator?.connection?.saveData){this.disable();return {active:false,atTarget:false,sceneReady:true,failed:false};}
    if(this.family!==family){this.disable();this.family=family;}this.enabled=true;
    let index=state.passage,amount=state.amount;
    // Retain either matching endpoint at a reading stop, avoiding an unnecessary swap.
    if(state.settled&&this.presented){
      if(this.presented.index===state.scene){index=state.scene;amount=0;}
      else if(this.presented.index===state.scene-1){index=state.scene-1;amount=1;}
    }
    const url=urlFor(index);
    if(!url){this.clearPresentation();return {active:false,atTarget:false,sceneReady:true,failed:true};}
    const entry=this.entryFor(url,index);this.active=entry;entry.amount=amount;this.setTarget(entry);
    if(entry.failed){this.clearPresentation();return {active:false,atTarget:false,sceneReady:true,failed:true};}
    if(entry.decoded&&close(entry.decodedTime,entry.target))this.present(entry);
    const atTarget=entry.decoded&&!entry.video.seeking&&close(entry.decodedTime,entry.target),shown=this.presented;
    const sceneReady=Boolean(shown&&state.settled&&((shown.index===state.scene&&close(shown.decodedTime,0))||(shown.index+1===state.scene&&Number.isFinite(shown.video.duration)&&close(shown.decodedTime,shown.video.duration-FRAME))));
    this.seek(entry);
    // Prepare a real neighbour without evicting an outgoing frame during handoff.
    if(this.presented===entry){
      let neighbour=index+(direction<0?-1:1);
      if(state.settled&&direction>=0&&state.scene<3&&index===state.scene-1)neighbour=state.scene;
      if(state.settled&&direction<0&&state.scene>0&&index===state.scene)neighbour=state.scene-1;
      const neighbourUrl=urlFor(neighbour);
      if(neighbourUrl&&neighbour!==index){const next=this.entryFor(neighbourUrl,neighbour);next.amount=neighbour<index?1:0;this.setTarget(next);this.seek(next);}
    }
    return {active:Boolean(this.presented),atTarget,sceneReady,failed:false};
  }
  disable(){this.enabled=false;this.active=null;this.clearPresentation();for(const entry of [...this.entries.values()])this.dispose(entry);}
}
