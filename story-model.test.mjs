import test from 'node:test';
import assert from 'node:assert/strict';
import {storyFrame,settleTarget} from './dist/story-model.mjs';
test('arrival and exit are complete readable scenes',()=>{
  assert.deepEqual(storyFrame(0),{from:0,to:1,blend:0,active:0,settled:true});
  assert.deepEqual(storyFrame(3),{from:3,to:3,blend:0,active:3,settled:true});
  assert.equal(storyFrame(-2).active,0);assert.equal(storyFrame(9).active,3);
});
test('each chapter has a hold and each passage only mixes its neighbours',()=>{
  for(let chapter=0;chapter<3;chapter++){
    assert.equal(storyFrame(chapter+.2).blend,0);
    assert.equal(storyFrame(chapter+.8).blend,1);
    const mid=storyFrame(chapter+.5);assert.equal(mid.from,chapter);assert.equal(mid.to,chapter+1);assert.ok(Math.abs(mid.blend-.5)<1e-9);
  }
});
test('reverse scrolling retraces the same visual state',()=>{
  const forward=Array.from({length:301},(_,i)=>storyFrame(i/100));
  const reverse=Array.from({length:301},(_,i)=>storyFrame((300-i)/100)).reverse();
  assert.deepEqual(forward,reverse);
  for(const frame of forward){assert.ok(frame.blend>=0&&frame.blend<=1);assert.ok(frame.active>=0&&frame.active<4);}
});
test('settling follows intent only inside a transition and never traps exit',()=>{
  assert.equal(settleTarget(.5,1),1);assert.equal(settleTarget(1.5,-1),1);
  for(const p of [-1,0,.2,.8,1,2.2,2.8,3,4])assert.equal(settleTarget(p,1),null);
  assert.equal(settleTarget(.5,0),null);
});
