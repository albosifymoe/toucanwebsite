export const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
export const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
// Units are viewport heights. Reading holds and action have independent space.
export const timeline=[
  {kind:'hold',scene:0,length:.35}, {kind:'motion',passage:0,length:2},
  {kind:'hold',scene:1,length:.45}, {kind:'motion',passage:1,length:2},
  {kind:'hold',scene:2,length:.45}, {kind:'motion',passage:2,length:2},
  {kind:'hold',scene:3,length:.55},
];
let cursor=0;
for(const segment of timeline){segment.start=cursor;cursor+=segment.length;segment.end=cursor;Object.freeze(segment);}
export const STORY_LENGTH=cursor;
export const chapterPositions=timeline.filter(s=>s.kind==='hold').map((s,i)=>i===0?0:s.start+s.length/2);
export function storyFrame(position){
  const p=clamp(position,0,STORY_LENGTH),s=timeline.find(segment=>p<segment.end)??timeline.at(-1);
  if(s.kind==='hold')return {from:s.scene,to:s.scene,active:s.scene,scene:s.scene,blend:0,settled:true,passage:Math.min(s.scene,2),amount:s.scene===3?1:0};
  const amount=clamp((p-s.start)/s.length);
  return {from:s.passage,to:s.passage+1,active:amount<.5?s.passage:s.passage+1,scene:null,blend:amount,settled:false,passage:s.passage,amount};
}
