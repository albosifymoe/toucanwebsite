// Keep one pending seek per clip, replacing stale destinations with the latest scroll position.
export class ScrollFilm {
  constructor(stage,manifest,onFrame){
    this.stage=stage;this.manifest=manifest;this.onFrame=onFrame;this.entries=new Map();this.active=null;this.target=0;this.enabled=false;
    this.layer=document.createElement('div');this.layer.className='motion-film';this.layer.setAttribute('aria-hidden','true');stage.prepend(this.layer);
    this.portrait=matchMedia('(max-width: 900px) and (orientation: portrait)');
  }
  entryFor(url){
    if(this.entries.has(url)){const entry=this.entries.get(url);this.entries.delete(url);this.entries.set(url,entry);return entry;}
    // Retain only the active passage and its neighbour; release older decoders.
    if(this.entries.size>=2){
      const [oldUrl,old]=this.entries.entries().next().value;
      old.disposed=true;old.video.pause();old.video.removeAttribute('src');old.video.load();old.video.remove();this.entries.delete(oldUrl);
    }
    const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';video.tabIndex=-1;video.setAttribute('aria-hidden','true');video.hidden=true;
    const entry={video,failed:false,ready:false,target:0};this.entries.set(url,entry);this.layer.append(video);
    video.addEventListener('error',()=>{if(entry.disposed)return;entry.failed=true;entry.ready=false;if(this.active===entry)this.disable();this.onFrame();});
    video.addEventListener('loadedmetadata',()=>this.seek(entry));
    video.addEventListener('loadeddata',()=>{entry.ready=true;this.seek(entry);this.onFrame();});
    video.addEventListener('seeked',()=>{entry.ready=true;this.seek(entry);this.onFrame();});
    video.src=url;video.load();return entry;
  }
  seek(entry){
    const video=entry.video;
    if(entry.disposed||entry.failed||video.readyState<1||video.seeking||!Number.isFinite(video.duration))return;
    const desired=Math.max(0,Math.min(entry.target,Math.max(0,video.duration-1/24)));
    if(Math.abs(video.currentTime-desired)>1/48){
      entry.ready=false;
      try{video.currentTime=desired;}catch{entry.failed=true;this.disable();}
    }
  }
  update(state,enabled){
    const family=this.portrait.matches?'portrait':'landscape';
    const index=Math.min(state.from,2),amount=state.from===3?1:state.blend;
    const spec=this.manifest[family]?.[index];
    const ratio=family==='portrait'?9/16:16/9;
    const drawnWidth=Math.min(innerWidth,innerHeight*ratio),drawnHeight=drawnWidth/ratio;
    const needs4K=Math.max(drawnWidth,drawnHeight)*(globalThis.devicePixelRatio||1)>2304;
    const url=typeof spec==='string'?spec:needs4K?spec?.high:spec?.standard;
    if(!enabled||!url||navigator.connection?.saveData){this.disable();return {active:false,atTarget:false};}
    const entry=this.entryFor(url);
    if(entry.failed){this.disable();return {active:false,atTarget:false};}
    if(this.active!==entry){
      this.stage.classList.remove('has-film');
      for(const item of this.entries.values())item.video.hidden=item!==entry;
      this.active=entry;
    }
    this.enabled=true;
    const duration=entry.video.duration;
    entry.target=Number.isFinite(duration)?amount*Math.max(0,duration-1/24):0;
    this.seek(entry);
    const atTarget=entry.ready&&entry.video.readyState>=2&&!entry.video.seeking&&Math.abs(entry.video.currentTime-entry.target)<1/12;
    // Retain the most recently decoded film frame during an in-flight seek.
    const active=atTarget||this.stage.classList.contains('has-film');
    this.stage.classList.toggle('has-film',active);
    return {active,atTarget};
  }
  disable(){this.enabled=false;this.stage.classList.remove('has-film');}
}
