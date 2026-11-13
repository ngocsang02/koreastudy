import { BRAND_NAME } from './brand.js';
import {scheduleReview,isCorrectAnswer,DAY} from './review-store.js';

const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function choiceOptions(word,words){
  const seen=new Set([word.meaning]);const others=[];
  for(const x of shuffle(words))if(!seen.has(x.meaning)){seen.add(x.meaning);others.push(x.meaning);if(others.length===3)break;}
  return shuffle([word.meaning,...others]);
}
function intervalText(ms){return ms<3600000?Math.max(1,Math.ceil(ms/60000))+' phút':ms<DAY?Math.ceil(ms/3600000)+' giờ':Math.ceil(ms/DAY)+' ngày';}
function dateText(time){return new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(time));}

export function createReviewController(data,store,progress){
  const words=data.words,byId=new Map(words.map(w=>[w.id,w]));
  let host=null,lesson='',book='',includePending=false,reviewSource='',session=null,feedback='',selectedLeft=null,selectedRight=null,matched=new Set(),mistakes=new Set(),rightOrder=[];
  let previousUser=store.userId;
  const active=()=>host?.isConnected&&window.location.hash.split('/')[0]==='#review';
  const modes=[['flashcards','Lật thẻ','Tự nhớ nghĩa trước khi lật đáp án.','▱'],['writing','Gõ từ tiếng Hàn','Nhìn nghĩa Việt, tự viết lại bằng Hangul.','가'],['choice','Chọn nghĩa','Nhận diện nghĩa đúng trong các lựa chọn.','✓'],['match','Ghép cặp','Nối từ tiếng Hàn với nghĩa tiếng Việt.','⇄']];
  const currentWords=()=>words.filter(w=>(includePending||w.verificationStatus==='verified'||w.verificationStatus==='supplemental')&&(!reviewSource||(reviewSource==='topik'?w.topikTrack:w.verificationStatus===reviewSource))&&(!book||w.book===book)&&(!lesson||w.lesson===lesson));
  function candidates(group){
    const base=currentWords(),saved=new Set(progress.snapshot().saved);
    if(group==='due'){const ids=new Set(base.map(w=>w.id));return store.due(ids).map(id=>byId.get(id));}
    if(group==='new')return base.filter(w=>!store.cards[w.id]);
    if(group==='difficult')return base.filter(w=>store.cards[w.id]?.lastRating==='again'||store.cards[w.id]?.lastRating==='hard');
    if(group==='saved')return base.filter(w=>saved.has(w.id));
    return base;
  }
  const modeName=mode=>modes.find(m=>m[0]===mode)?.[1]||'';
  function methodHTML(){return `<details class="review-method"><summary>Vì sao cần ôn lại? Lịch ôn được tính thế nào?</summary><div><p>Thử nhớ lại trước khi xem đáp án giúp luyện khả năng tự truy xuất. Ôn ở nhiều thời điểm khác nhau hữu ích hơn việc chỉ đọc dồn một lần.</p><p><b>Lịch khởi điểm của ${esc(BRAND_NAME)}:</b> nhớ rõ → sau 1, 3, 7, 14, 30, 60 rồi 120 ngày giữa các lượt nhớ đúng. Không nhớ → 10 phút. Nhớ chậm → 1 ngày và giảm một bậc.</p><p>Đây là quy tắc thực hành để bắt đầu, không phải lịch tối ưu cho mọi người; chưa phải thuật toán FSRS hoặc SM-2. Một lần trả lời đúng không đồng nghĩa đã nhớ vĩnh viễn. Đến hạn muộn vẫn ôn được. Nếu luyện thêm trước hạn và nhớ đúng, lịch cũ được giữ nguyên; không tự tăng bậc vì lặp liên tục trong cùng ngày.</p><p><a href="https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_Science.pdf" target="_blank" rel="noopener noreferrer">Karpicke & Roediger (2008)</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/19076480/" target="_blank" rel="noopener noreferrer">Cepeda và cộng sự (2008)</a> · <a href="https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Bauernschmidt_JEPLMC.pdf" target="_blank" rel="noopener noreferrer">Karpicke & Bauernschmidt (2011)</a></p><p>Lịch được hiển thị trong web; không tự gửi email hoặc thông báo hệ thống. Chế độ khách lưu trên trình duyệt này.</p></div></details>`;}
  function hub(){
    if(!active())return;
    if(progress.snapshot().userId!==store.userId){host.innerHTML='<p class="body-copy" role="status">Đang tải lịch ôn của tài khoản…</p>';return;}
    const base=currentWords(),due=candidates('due').length,newCount=candidates('new').length,difficult=candidates('difficult').length;
    const next=base.map(w=>store.cards[w.id]?.dueAt).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];
    const options=data.lessons.filter(l=>!book||l.book===book);
    host.innerHTML=`<section class="review-hub"><div class="search-heading"><div class="eyebrow">MỖI NGÀY MỘT CHÚT</div><h1>Hôm nay mình ôn gì?</h1><p>Ưu tiên từ đến lịch, rồi dành vài phút cho những từ còn khó nhớ.</p></div><div class="review-dashboard"><button class="review-stat primary-stat" data-review-group="due"><small>ĐẾN LỊCH NGAY</small><b>${due}</b><span>từ cần ôn <i>→</i></span></button><button class="review-stat" data-review-group="difficult"><small>TỪ CÒN KHÓ NHỚ</small><b>${difficult}</b><span>ưu tiên luyện thêm <i>→</i></span></button><button class="review-stat" data-review-group="new"><small>CHƯA VÀO LỊCH ÔN</small><b>${newCount}</b><span>bắt đầu một lượt mới <i>→</i></span></button></div><div class="review-filterbar"><label>Quyển<select id="srs-book" class="search-select"><option value="">Tất cả quyển</option>${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${String(n)===book?'selected':''}>Quyển ${n}</option>`).join('')}</select></label><label>Bài học<select id="srs-lesson" class="search-select"><option value="">Tất cả bài</option>${options.map(l=>`<option value="${l.id}" ${l.id===lesson?'selected':''}>${esc(l.id)} · ${esc(l.title)}</option>`).join('')}</select></label><label>Nguồn từ<select id="srs-source" class="search-select"><option value="">Sách & TOPIK I bổ sung</option><option value="topik" ${reviewSource==='topik'?'selected':''}>TOPIK I bổ sung</option><option value="verified" ${reviewSource==='verified'?'selected':''}>Đã đối chiếu sách</option></select></label><label class="review-checkbox"><input id="srs-pending" type="checkbox" ${includePending?'checked':''}> Gồm nội dung cũ chờ đối chiếu</label></div><p class="review-scope-note">${includePending?'Bạn đang ôn thêm cả nội dung cũ chưa đối chiếu với giáo trình.':'Mặc định gồm từ đã đối chiếu sách và bộ TOPIK I bổ sung do '+esc(BRAND_NAME)+' tuyển chọn. TOPIK I bổ sung chưa được xác nhận có trong sách.'} ${next?'Lượt tiếp theo: <b>'+esc(dateText(next))+'</b>.':''} ${store.status==='sync-error'?'Lịch ôn chưa đồng bộ lên tài khoản; dữ liệu vẫn giữ trên máy.':''}</p><div class="section-heading"><div><h2>Chọn cách luyện</h2><p>Mỗi lượt tối đa 10 từ. Gõ từ và lật thẻ khuyến khích tự nhớ; chọn nghĩa, ghép cặp giúp làm quen.</p></div><a href="#grammar-review" class="text-button">Ôn ngữ pháp riêng ↗</a></div><div class="review-mode-grid">${modes.map(([id,title,desc,icon])=>`<article class="review-mode"><span class="mode-icon" aria-hidden="true">${icon}</span><h3>${title}</h3><p>${desc}</p><button class="button button-outline" data-review-mode="${id}">Chọn chế độ →</button></article>`).join('')}</div><div class="review-shortcuts"><button class="button button-primary" data-review-start="due">Ôn từ đến lịch (${due})</button><button class="button button-outline" data-review-start="new">Luyện từ mới</button><button class="button button-outline" data-review-start="saved">Ôn từ đã lưu</button></div><div id="review-mode-picker"></div>${methodHTML()}</section>`;
    host.querySelector('#srs-book').onchange=e=>{book=e.target.value;lesson='';hub();};
    host.querySelector('#srs-lesson').onchange=e=>{lesson=e.target.value;hub();};
    host.querySelector('#srs-source').onchange=e=>{reviewSource=e.target.value;hub();};
    host.querySelector('#srs-pending').onchange=e=>{includePending=e.target.checked;hub();};
    host.querySelectorAll('[data-review-group]').forEach(b=>b.onclick=()=>start('flashcards',b.dataset.reviewGroup));
    host.querySelectorAll('[data-review-start]').forEach(b=>b.onclick=()=>start('flashcards',b.dataset.reviewStart));
    host.querySelectorAll('[data-review-mode]').forEach(b=>b.onclick=()=>pickGroup(b.dataset.reviewMode));
  }
  function pickGroup(mode){
    const el=host.querySelector('#review-mode-picker');
    el.innerHTML=`<div class="mode-picker"><b>${modeName(mode)} · Bạn muốn ôn nhóm nào?</b><div class="detail-actions">${[['due','Đến lịch'],['difficult','Khó nhớ'],['new','Từ mới'],['saved','Đã lưu'],['all','Tất cả']].map(([id,label])=>`<button class="button button-outline" data-pick-group="${id}">${label} (${candidates(id).length})</button>`).join('')}</div></div>`;
    el.querySelectorAll('[data-pick-group]').forEach(b=>b.onclick=()=>start(mode,b.dataset.pickGroup));el.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function start(mode,group){
    if(progress.snapshot().userId!==store.userId)return;
    let list=candidates(group);if(group!=='due')list=shuffle(list);
    if(mode==='match'){const meanings=new Set();list=list.filter(w=>{if(meanings.has(w.meaning))return false;meanings.add(w.meaning);return true;});}
    if(!list.length){host.querySelector('#review-mode-picker').innerHTML=`<div class="empty-state"><h3>Chưa có từ trong nhóm này.</h3><p>${group==='due'?'Từ chưa đến lịch sẽ xuất hiện đúng thời điểm. Bạn có thể luyện từ mới hoặc chọn chế độ luyện khác.':'Thử chọn bài khác, lưu thêm từ hoặc kiểm tra bộ lọc nguồn sách.'}</p></div>`;return;}
    session={mode,group,items:list.slice(0,mode==='match'?5:10),index:0,answered:false,revealed:false,correct:0,results:[],options:[]};
    feedback='';matched=new Set();mistakes=new Set();selectedLeft=selectedRight=null;rightOrder=shuffle(session.items);
    renderSession();host.scrollIntoView({block:'start',behavior:'smooth'});
  }
  function explain(w){return `${w.usage?`<p class="word-usage">${esc(w.usage)}</p>`:''}${w.example?`<div class="word-example"><p lang="ko">${esc(w.example)}</p><small>${esc(w.translation)}</small></div>`:''}`;}
  function rate(w,rating){
    const card=store.rate(w.id,rating);session.results.push({id:w.id,rating,dueAt:card.dueAt});
    if(rating!=='again')session.correct++;
    const p=progress.snapshot();if(!p.learned.includes(w.id))progress.update(p.saved,[...p.learned,w.id]);
    return card;
  }
  function scheduleLabel(w,rating){return intervalText(scheduleReview(store.cards[w.id],rating).dueAt-Date.now());}
  function headerHTML(){return `<div class="practice-top"><button class="text-button" id="srs-exit">← Về khu ôn tập</button><span>${modeName(session.mode)} · ${session.mode==='match'?matched.size:session.index}/${session.items.length}</span></div>`;}
  function renderSession(){
    if(!session||!active())return;
    if(session.mode==='match'){renderMatch();return;}
    if(session.index>=session.items.length){finish();return;}
    const w=session.items[session.index],l=data.lessons.find(l=>l.id===w.lesson);
    if(!session.options.length&&session.mode==='choice')session.options=choiceOptions(w,words.filter(x=>includePending||x.verificationStatus==='verified'||x.verificationStatus==='supplemental'));
    let question='';
    if(session.mode==='flashcards')question=`<h2 lang="ko">${esc(w.word)}</h2><p>Tự nhớ nghĩa trước khi bấm xem đáp án.</p>${!session.revealed?'<button class="button button-primary" id="srs-reveal">Xem đáp án →</button>':`<div class="srs-answer"><h3>${esc(w.meaning)}</h3>${explain(w)}<div class="srs-ratings">${[['again','Không nhớ'],['hard','Nhớ chậm'],['good','Nhớ rõ']].map(([r,t])=>`<button class="button ${r==='good'?'button-primary':'button-outline'}" data-rating="${r}">${t}<small>${scheduleLabel(w,r)}</small></button>`).join('')}</div></div>`}`;
    if(session.mode==='writing')question=`<h2 class="writing-prompt">${esc(w.meaning)}</h2><p>Viết từ hoặc cụm từ tiếng Hàn tương ứng.</p><form id="srs-write-form"><label class="sr-only" for="srs-answer">Đáp án tiếng Hàn</label><input id="srs-answer" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ko" placeholder="Gõ bằng Hangul…" ${session.answered?'disabled':''}><button class="button button-primary" type="submit" ${session.answered?'disabled':''}>Kiểm tra</button></form><small class="answer-hint">Bỏ qua khoảng trắng và dấu . ? !; không tự chấp nhận từ đồng nghĩa hoặc từ khác.</small>`;
    if(session.mode==='choice')question=`<h2 lang="ko">${esc(w.word)}</h2><p>Chọn nghĩa phù hợp với bài học.</p><div class="choice-grid">${session.options.map((meaning,i)=>`<button class="choice-option ${session.answered&&meaning===w.meaning?'correct':''}" data-choice="${i}" ${session.answered?'disabled':''}>${esc(meaning)}</button>`).join('')}</div>`;
    host.innerHTML=`<section class="practice-session">${headerHTML()}<div class="practice-progress"><span style="width:${session.index/session.items.length*100}%"></span></div><article class="srs-card"><small class="practice-location">Quyển ${w.book} · Bài ${w.lesson.split('.')[1]} · ${esc(l.title)}</small>${w.verificationStatus==='supplemental'?'<p class="topik-label">TOPIK I bổ sung · Theo chủ đề Quyển 1</p>':w.verificationStatus==='pending'?'<p class="pending-label">Nội dung chưa đối chiếu giáo trình</p>':''}${question}${feedback?`<div class="practice-feedback" role="status">${feedback}</div><button class="button button-primary" id="srs-next">Từ tiếp theo →</button>`:''}</article></section>`;
    host.querySelector('#srs-exit').onclick=()=>{session=null;hub();};
    if(session.mode==='flashcards'){
      const reveal=host.querySelector('#srs-reveal');if(reveal)reveal.onclick=()=>{session.revealed=true;renderSession();};
      host.querySelectorAll('[data-rating]').forEach(b=>b.onclick=()=>{rate(w,b.dataset.rating);next();});
    }
    if(session.mode==='writing'&&!session.answered){const form=host.querySelector('#srs-write-form');form.onsubmit=e=>{e.preventDefault();const input=host.querySelector('#srs-answer').value;if(!input.trim()){host.querySelector('#srs-answer').focus();return;}answer(w,isCorrectAnswer(input,w.word));};host.querySelector('#srs-answer').focus({preventScroll:true});}
    host.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(w,session.options[Number(b.dataset.choice)]===w.meaning));
    const nextButton=host.querySelector('#srs-next');if(nextButton)nextButton.onclick=next;
  }
  function answer(w,correct){
    if(session.answered)return;session.answered=true;const card=rate(w,correct?'good':'again');
    feedback=`<b>${correct?'Đúng rồi.':'Chưa đúng.'}</b><p><span lang="ko">${esc(w.word)}</span> — ${esc(w.meaning)}</p><small>Ôn lại: ${esc(dateText(card.dueAt))}. ${correct?'':'Xem đáp án rồi tự gõ lại trong đầu trước khi chuyển từ.'}</small>${explain(w)}`;
    renderSession();
  }
  function next(){session.index++;session.answered=false;session.revealed=false;session.options=[];feedback='';renderSession();}
  function renderMatch(){
    host.innerHTML=`<section class="practice-session">${headerHTML()}<article class="srs-card"><h2 class="matching-title">Ghép từ với nghĩa</h2><p>Chọn một từ bên trái, rồi chọn nghĩa tương ứng bên phải.</p><div class="matching-board"><div>${session.items.map(w=>`<button class="match-tile ${matched.has(w.id)?'matched':''} ${selectedLeft===w.id?'selected':''}" data-left="${w.id}" ${matched.has(w.id)?'disabled':''} lang="ko">${esc(w.word)}</button>`).join('')}</div><div>${rightOrder.map(w=>`<button class="match-tile ${matched.has(w.id)?'matched':''} ${selectedRight===w.id?'selected':''}" data-right="${w.id}" ${matched.has(w.id)?'disabled':''}>${esc(w.meaning)}</button>`).join('')}</div></div><p role="status" class="match-feedback">${esc(feedback||'Không cần vội. Hãy đọc từng từ trước khi chọn.')}</p>${matched.size===session.items.length?'<button class="button button-primary" id="srs-finish">Xem kết quả →</button>':''}</article></section>`;
    host.querySelector('#srs-exit').onclick=()=>{session=null;hub();};
    host.querySelectorAll('[data-left]').forEach(b=>b.onclick=()=>{selectedLeft=b.dataset.left;match();});host.querySelectorAll('[data-right]').forEach(b=>b.onclick=()=>{selectedRight=b.dataset.right;match();});
    const end=host.querySelector('#srs-finish');if(end)end.onclick=finish;
  }
  function match(){
    if(selectedLeft&&selectedRight){
      const left=byId.get(selectedLeft),right=byId.get(selectedRight);
      if(left.id===right.id){matched.add(selectedLeft);rate(left,mistakes.has(left.id)?'hard':'good');feedback='Đúng rồi: '+left.word+' — '+left.meaning;}
      else{mistakes.add(selectedLeft);feedback='Chưa khớp. Hãy thử lại; từ này sẽ được ưu tiên ôn sớm.';}
      selectedLeft=selectedRight=null;
    }
    renderMatch();
  }
  function finish(){
    const results=session.results,mode=session.mode;
    host.innerHTML=`<section class="practice-session">${headerHTML()}<div class="session-complete"><span class="complete-mark">✓</span><h1>Xong một lượt ôn.</h1><p>${results.length} từ đã luyện · ${session.correct} lượt nhớ đúng${mode==='flashcards'?' theo tự đánh giá':''}.</p><p>Lịch ôn đã được cập nhật. Không cần lặp đi lặp lại ngay những từ vừa nhớ rõ.</p><div class="scheduled-results">${results.map(r=>{const w=byId.get(r.id);return `<div><span lang="ko">${esc(w.word)}</span><span>${esc(dateText(r.dueAt))}</span></div>`;}).join('')}</div><button class="button button-primary" id="srs-back">Về lịch ôn →</button><p class="source-note">“Đã học” ghi nhận bạn đã gặp từ. Lịch ôn phản ánh kết quả các lượt nhớ lại, không đảm bảo đã nhớ vĩnh viễn.</p></div></section>`;
    host.querySelector('#srs-back').onclick=()=>{session=null;hub();};host.querySelector('#srs-exit').onclick=()=>{session=null;hub();};
  }
  function updateBadge(){const badge=document.getElementById('due-badge');if(badge)badge.textContent=store.due(words.map(w=>w.id)).length;}
  store.subscribe(next=>{
    if(next.userId!==previousUser){previousUser=next.userId;session=null;feedback='';}
    updateBadge();
    if(!session&&active())hub();
  });
  updateBadge();
  const refresh=()=>{updateBadge();if(!session&&active())hub();};window.addEventListener('focus',refresh);window.setInterval(refresh,60000);
  return {render(element,options={}){host=element;host.innerHTML='';session=null;lesson=options.lesson||'';if(lesson)book=data.lessons.find(l=>l.id===lesson)?.book||'';hub();},start};
}
