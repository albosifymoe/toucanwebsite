import test from 'node:test';
import assert from 'node:assert/strict';
import {storyFrame,timeline,STORY_LENGTH,chapterPositions} from './dist/story-model.mjs';
test('each chapter destination is a settled reading state',()=>{
  chapterPositions.forEach((position,scene)=>{assert.equal(storyFrame(position).settled,true);assert.equal(storyFrame(position).scene,scene);});
  assert.equal(storyFrame(-1).scene,0);assert.equal(storyFrame(STORY_LENGTH+1).scene,3);
});
test('action gets two viewports with linear, reversible time and exact endpoints',()=>{
  for(const span of timeline.filter(s=>s.kind==='motion')){
    assert.equal(span.length,2);
    for(const fraction of [0,.1,.25,.5,.75,.9]){
      const frame=storyFrame(span.start+span.length*fraction);
      assert.equal(frame.passage,span.passage);assert.ok(Math.abs(frame.amount-fraction)<1e-9);
    }
    assert.equal(storyFrame(span.end).scene,span.passage+1);
  }
});
test('repeating a stopped scroll position never advances the story',()=>{
  for(const span of timeline.filter(s=>s.kind==='motion')){
    const p=span.start+span.length*.47,initial=storyFrame(p);
    for(let i=0;i<300;i++)assert.deepEqual(storyFrame(p),initial);
  }
});
