export const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
export const smooth=(value)=>{const t=clamp(value);return t*t*(3-2*t);};
export function storyFrame(progress,count=4){
  const p=clamp(progress,0,count-1),from=Math.min(Math.floor(p),count-1),to=Math.min(from+1,count-1);
  const blend=from===to?0:smooth((p-from-.3)/.4);
  return {from,to,blend,active:blend>=.5?to:from,settled:blend===0||blend===1};
}
export function settleTarget(progress,direction,count=4){
  if(progress<=0||progress>=count-1||!direction)return null;
  const fraction=progress-Math.floor(progress);
  if(fraction<=.3||fraction>=.7)return null;
  return direction>0?Math.ceil(progress):Math.floor(progress);
}
