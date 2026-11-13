import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scheduleReview,ReviewStore,DAY,isCorrectAnswer} from '../src/review-store.js';
import {choiceOptions} from '../src/review-ui.js';
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
test('successes space reviews over days; forgetting returns to a short learning step',()=>{
  let state;let now=10000;
  for(const days of [1,3,7,14,30,60,120,120]){state=scheduleReview(state,'good',now);assert.equal(state.dueAt,now+days*DAY);now=state.dueAt;}
  const again=scheduleReview(state,'again',now);assert.equal(again.dueAt,now+600000);assert.equal(again.stage,0);assert.equal(again.lapses,1);
  const hard=scheduleReview(state,'hard',now);assert.equal(hard.dueAt,now+DAY);assert.equal(hard.stage,6);
});
test('Hangul input accepts whitespace/punctuation, but not a different word or empty input',()=>{
  assert(isCorrectAnswer('안녕하세요','안녕하세요?'));assert(isCorrectAnswer('관광가이드','관광 가이드'));
  assert(isCorrectAnswer('한국','한국'));assert(!isCorrectAnswer('학교','한국'));assert(!isCorrectAnswer('','한국'));
});
test('choice questions contain the correct meaning once and no duplicate options',()=>{
  const w={meaning:'Hàn Quốc'},words=[w,{meaning:'Hàn Quốc'},{meaning:'Việt Nam'},{meaning:'Trung Quốc'},{meaning:'Nhật Bản'}];
  const options=choiceOptions(w,words);assert.equal(options.length,4);assert.equal(new Set(options).size,4);assert.equal(options.filter(x=>x==='Hàn Quốc').length,1);
});
test('due filtering uses exact timestamps and enrollment does not erase review history',()=>{
  const store=new ReviewStore(['V1-1-1','V1-1-2'],memory());store.enroll('V1-1-1',1000);
  assert.deepEqual(store.due(['V1-1-1','V1-1-2'],999),[]);assert.deepEqual(store.due(['V1-1-1'],1000),['V1-1-1']);
  store.rate('V1-1-1','good',1000);store.enroll('V1-1-1',2000);assert.equal(store.cards['V1-1-1'].reviews,1);
  assert.deepEqual(store.due(['V1-1-1'],1000+DAY-1),[]);
});
test('early practice cannot advance a card to long intervals or postpone an earlier due time',()=>{
  const first=scheduleReview(null,'good',0);
  const early=scheduleReview(first,'good',1000);assert.equal(early.stage,1);assert.equal(early.dueAt,DAY);assert.equal(early.reviews,2);
  const again=scheduleReview(first,'again',1000);const hard=scheduleReview(again,'hard',2000);assert.equal(hard.dueAt,601000);
  const onTime=scheduleReview(first,'good',DAY);assert.equal(onTime.stage,2);assert.equal(onTime.dueAt,4*DAY);
});
test('offline review writes survive reload and accounts remain separate',async()=>{
  const storage=memory(),cloud={};let offline=false;
  const adapter={push:async(uid,rows)=>{if(offline)throw Error();cloud[uid]={...cloud[uid],...rows}},pull:async uid=>cloud[uid]||{}};
  const store=new ReviewStore(['V1-1-1'],storage);await store.connect('a',adapter);
  offline=true;store.rate('V1-1-1','again',1000);await store.sync();assert.equal(store.status,'sync-error');
  const restored=new ReviewStore(['V1-1-1'],storage);offline=false;await restored.connect('a',adapter);
  assert.equal(cloud.a['V1-1-1'].dueAt,601000);
  await restored.connect('b',adapter);assert.deepEqual(restored.cards,{});
  await restored.connect('a',adapter);assert.equal(restored.cards['V1-1-1'].lapses,1);
});
test('late responses from previous accounts cannot replace the current account',async()=>{
  let resolve;const gate=new Promise(r=>resolve=r);const store=new ReviewStore(['V1-1-1'],memory());
  const adapter={push:async()=>{},pull:uid=>uid==='a'?gate:Promise.resolve({})};
  const first=store.connect('a',adapter);await store.connect('b',adapter);resolve({'V1-1-1':scheduleReview(null,'good',0)});await first;
  assert.equal(store.userId,'b');assert.deepEqual(store.cards,{});
});
