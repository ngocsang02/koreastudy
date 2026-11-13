import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ProgressStore} from '../src/progress.js';
const memory = () => {const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,v)=>values.set(key,v)}};
const deferred = () => {let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};

test('guest progress migrates and remains separate from user accounts',async()=>{
  const storage=memory();storage.setItem('hanul-saved-v1','["E2","unknown"]');
  const store=new ProgressStore(['E2','E3'],storage);
  assert.deepEqual(store.snapshot().saved,['E2']);
  store.update(['E2'],['E3']);
  const adapter={push:async()=>{},pull:async()=>[{grammar_id:'E3',saved:true,learned:false}]};
  await store.connect('user-a',adapter);
  assert.deepEqual(store.snapshot().saved,['E3']);
  assert.deepEqual(store.snapshot().learned,[]);
  await store.connect(null,null);
  assert.deepEqual(store.snapshot().saved,['E2']);
  assert.deepEqual(store.snapshot().learned,['E3']);
});

test('offline changes including unmark persist and retry',async()=>{
  const storage=memory();let fail=false;const cloud=new Map([['E2',{saved:true,learned:true}]]);
  const adapter={push:async(uid,rows)=>{if(fail)throw Error('offline');for(const [id,row]of Object.entries(rows))cloud.set(id,row)},pull:async()=>[...cloud].map(([grammar_id,row])=>({grammar_id,...row}))};
  const store=new ProgressStore(['E2'],storage);await store.connect('a',adapter);
  fail=true;store.update([],[]);await store.sync();
  assert.equal(store.status,'sync-error');assert.deepEqual(store.snapshot().saved,[]);
  const reloaded=new ProgressStore(['E2'],storage);fail=false;await reloaded.connect('a',adapter);
  assert.deepEqual(cloud.get('E2'),{saved:false,learned:false});assert.equal(reloaded.status,'synced');
});

test('an old account response cannot leak into the next account',async()=>{
  const gate=deferred();
  const adapter={push:async()=>{},pull:async uid=>{if(uid==='a')return gate.promise;return [{grammar_id:'E3',saved:true,learned:false}]}};
  const store=new ProgressStore(['E2','E3'],memory());const first=store.connect('a',adapter);
  await store.connect('b',adapter);gate.resolve([{grammar_id:'E2',saved:true,learned:true}]);await first;
  assert.equal(store.snapshot().userId,'b');assert.deepEqual(store.snapshot().saved,['E3']);
});

test('edits during upload are queued instead of discarded',async()=>{
  const gate=deferred();let block=false;const cloud=new Map();
  const adapter={push:async(uid,rows)=>{if(block){block=false;await gate.promise}for(const [id,row]of Object.entries(rows))cloud.set(id,row)},pull:async()=>[...cloud].map(([grammar_id,row])=>({grammar_id,...row}))};
  const store=new ProgressStore(['E2'],memory());await store.connect('a',adapter);
  block=true;store.update(['E2'],[]);store.update([],['E2']);gate.resolve();await store.sync();
  assert.deepEqual(cloud.get('E2'),{saved:false,learned:true});
});

test('blocked browser storage does not stop learning',()=>{
  const store=new ProgressStore(['E2'],{getItem(){throw Error()},setItem(){throw Error()}});
  store.update(['E2'],[]);assert.deepEqual(store.snapshot().saved,['E2']);assert.equal(store.status,'storage-error');
});
