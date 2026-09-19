import test from 'node:test';
import assert from 'node:assert/strict';
import * as story from './dist/story-model.mjs';
const {storyFrame,timeline,STORY_LENGTH,chapterPositions}=story;
test('phones and touch-first tablets never enter the video-seeking scroll mode',()=>{
  for(const [width,height,coarse] of [[320,568,false],[390,844,true],[844,390,true],[1024,1366,true],[1366,1024,true]]){
    assert.equal(story.supportsStoryMotion(false,width,height,coarse),false);
  }
});

test('desktop scroll mode still respects reduced motion and short viewports',()=>{
  assert.equal(story.supportsStoryMotion(false,1440,900,false),true);
  assert.equal(story.supportsStoryMotion(true,1440,900,false),false);
  assert.equal(story.supportsStoryMotion(false,1440,419,false),false);
});
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
