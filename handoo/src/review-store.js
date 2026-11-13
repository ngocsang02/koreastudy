export const DAY = 86400000;
export const INTERVALS = [1,3,7,14,30,60,120];

// A transparent product heuristic, not SM-2/FSRS or a claim of optimal timing.
export function scheduleReview(previous, rating, now = Date.now()) {
  if(!['again','hard','good'].includes(rating)) throw new Error('Invalid rating');
  const prior=previous||{stage:0,lapses:0,reviews:0};
  // Extra practice before the due time must not simulate days of spaced recall.
  if(rating==='good'&&prior.reviews>0&&prior.dueAt>now){
    return {...prior,reviews:prior.reviews+1,lastRating:rating,lastReviewedAt:now};
  }
  const stage=rating==='good'?Math.min(7,prior.stage+1):rating==='hard'?Math.max(0,prior.stage-1):0;
  const minutes=rating==='again'?10:rating==='hard'?1440:INTERVALS[stage-1]*1440;
  const dueAt=rating==='hard'&&prior.dueAt>now?Math.min(prior.dueAt,now+minutes*60000):now+minutes*60000;
  return {stage,lapses:prior.lapses+(rating==='again'?1:0),reviews:prior.reviews+1,lastRating:rating,intervalMinutes:Math.ceil((dueAt-now)/60000),dueAt,lastReviewedAt:now};
}
export function normalizeKorean(text) {return String(text).normalize('NFC').trim().replace(/[\s.?!。？！]/g,'');}
export function isCorrectAnswer(input,answer){return !!normalizeKorean(input)&&normalizeKorean(input)===normalizeKorean(answer);}

export class ReviewStore {
  constructor(ids,storage=globalThis.localStorage){this.ids=new Set(ids);this.storage=storage;this.userId=null;this.adapter=null;this.generation=0;this.inflight=null;this.listeners=new Set();this.load();}
  get key(){return 'hanul-review-v1:'+(this.userId||'guest');}
  load(){
    this.cards={};this.pending={};this.status='local';
    try{
      const value=JSON.parse(this.storage.getItem(this.key)||'{}');
      for(const [id,card]of Object.entries(value.cards||{}))if(this.ids.has(id)&&this.valid(card))this.cards[id]=card;
      for(const [id,card]of Object.entries(value.pending||{}))if(this.ids.has(id)&&this.valid(card))this.pending[id]=card;
    }catch{this.status='storage-error';}
  }
  valid(c){return c&&Number.isFinite(c.dueAt)&&Number.isInteger(c.stage)&&c.stage>=0&&c.stage<=7&&Number.isInteger(c.reviews)&&c.reviews>=0&&Number.isInteger(c.lapses)&&c.lapses>=0&&['enrolled','again','hard','good'].includes(c.lastRating);}
  snapshot(){return {cards:{...this.cards},status:this.status,userId:this.userId};}
  subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  emit(){for(const fn of this.listeners)fn(this.snapshot());}
  save(){try{this.storage.setItem(this.key,JSON.stringify({cards:this.cards,pending:this.pending}));}catch{this.status='storage-error';}this.emit();}
  write(id,card){if(!this.ids.has(id))throw Error('Unknown vocabulary ID');this.cards[id]=card;if(this.userId)this.pending[id]=card;this.save();if(this.userId)void this.sync();}
  enroll(id,now=Date.now()){if(!this.ids.has(id)||this.cards[id])return;this.write(id,{stage:0,lapses:0,reviews:0,lastRating:'enrolled',intervalMinutes:0,dueAt:now,lastReviewedAt:null});}
  rate(id,rating,now=Date.now()){const card=scheduleReview(this.cards[id],rating,now);this.write(id,card);return card;}
  due(ids,now=Date.now()){return [...ids].filter(id=>this.cards[id]&&this.cards[id].dueAt<=now).sort((a,b)=>this.cards[a].dueAt-this.cards[b].dueAt);}
  async connect(userId,adapter){
    if(this.userId===userId&&this.adapter===adapter)return;
    this.generation++;this.inflight=null;this.userId=userId;this.adapter=adapter;this.load();this.emit();if(userId)await this.sync();
  }
  async sync(){
    if(!this.userId||!this.adapter)return;if(this.inflight)return this.inflight;
    const uid=this.userId,adapter=this.adapter,generation=this.generation,active=()=>generation===this.generation;
    this.status='syncing';this.emit();
    this.inflight=(async()=>{
      try{
        while(active()&&Object.keys(this.pending).length){
          const batch={...this.pending};await adapter.push(uid,batch);if(!active())return;
          for(const[id,row]of Object.entries(batch))if(this.pending[id]===row)delete this.pending[id];this.save();
        }
        const cloud=await adapter.pull(uid);if(!active())return;
        const merged={};for(const[id,row]of Object.entries(cloud))if(this.ids.has(id)&&this.valid(row))merged[id]=row;
        this.cards={...merged,...this.pending};this.status=Object.keys(this.pending).length?'pending':'synced';this.save();
      }catch{if(active()){this.status='sync-error';this.save();}}
      finally{if(active()){this.inflight=null;if(this.status==='pending')void this.sync();}}
    })();return this.inflight;
  }
}
