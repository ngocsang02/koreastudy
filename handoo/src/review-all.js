const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=value=>value.normalize('NFC').replace(/[\s.,!?·]/g,'').toLowerCase();
const shuffle=items=>[...items].sort(()=>Math.random()-.5);

export function createAllReview(host, words, playAudio, stopAudio){
  const total=words.length, chapters=Math.ceil(total/10);
  let order=shuffle(words), position=0, phase='intro', retry=false, retryWords=[], retryPosition=0;
  let wrong=new Set(), chapterWrong=new Set(), response=null, options=null, timer=null, disposed=false, round=0, effectiveType=null;
  const current=()=>retry?retryWords[retryPosition]:order[position];
  const questionType=()=>['meaning','korean','write','listen'][(retry?retryPosition+round:position)%4];
  const clearPending=()=>{clearTimeout(timer);stopAudio();};
  function optionsFor(word,type){
    const field=type==='korean'?'word':'meaning', key=normalize(word[field]);
    const seen=new Set([key]);
    const alternatives=shuffle(words).filter(item=>{const value=normalize(item[field]);if(!value||seen.has(value))return false;seen.add(value);return true;}).slice(0,3);
    return alternatives.length?shuffle([word,...alternatives]):null;
  }
  function startQuestion(){
    if(disposed)return;
    phase='question';response=null;options=null;effectiveType=null;render();
    if(effectiveType==='listen')playAudio(current(),2);
  }
  function next(){
    clearPending();
    if(retry){retryPosition++;if(retryPosition>=retryWords.length){phase='done';render();return;}}
    else {position++;if(position%10===0||position===total){phase='checkpoint';render();return;}}
    startQuestion();
  }
  function submit(value,skipped=false){
    if(response||phase!=='question')return;
    const word=current(),type=effectiveType,expected=type==='meaning'?word.meaning:word.word;
    const ok=!skipped&&normalize(value)===normalize(expected);
    response={ok};
    if(ok){if(retry)wrong.delete(word.id);}else{wrong.add(word.id);chapterWrong.add(word.id);}
    render();
    if(ok){let completed=false;const advance=()=>{if(completed||disposed||phase!=='question'||!response)return;completed=true;clearTimeout(timer);timer=setTimeout(next,800);};timer=setTimeout(advance,6000);playAudio(word,1,advance);}
    else playAudio(word,1);
  }
  function render(){
    if(disposed)return;
    if(!total){host.innerHTML='<div class="vl-practice"><p>Chưa có từ trong bài này để ôn tập.</p></div>';return;}
    if(phase==='intro'){
      host.innerHTML=`<section class="vl-practice all-review"><span class="vl-tag">ÔN TẤT CẢ</span><h2>Ôn trọn bộ từ vựng</h2><p>Bài này có ${total} từ · Chia thành ${chapters} chặng, mỗi chặng tối đa 10 từ.</p><p>Chọn nghĩa, viết và nghe xen kẽ. Những từ chưa nhớ sẽ được ôn lại sau.</p><button class="vl-primary" data-all-action="start">Bắt đầu ôn</button></section>`;return;
    }
    if(phase==='checkpoint'){
      const done=Math.min(position,total), remaining=total-done;
      host.innerHTML=`<section class="vl-practice all-review"><span class="vl-tag">HOÀN THÀNH CHẶNG ${Math.ceil(done/10)}/${chapters}</span><h2>Đã ôn ${done}/${total} từ</h2><p>${chapterWrong.size} từ cần xem lại trong chặng này · Tổng ${wrong.size} từ cần ôn lại.</p><button class="vl-primary" data-all-action="${remaining?'continue':'finish'}">${remaining?'Chặng tiếp theo':'Xem kết quả'}</button></section>`;return;
    }
    if(phase==='done'){
      const difficult=words.filter(w=>wrong.has(w.id));
      host.innerHTML=`<section class="vl-practice all-review"><span class="vl-tag">HOÀN THÀNH</span><h2>Đã gặp ${total}/${total} từ</h2><p>${difficult.length?`Còn ${difficult.length} từ cần ôn thêm.`:'Bạn đã trả lời đúng tất cả các từ trong vòng ôn hiện tại.'}</p>${difficult.length?`<ul class="all-review-difficult">${difficult.map(w=>`<li><strong lang="ko">${escapeHtml(w.word)}</strong><span>${escapeHtml(w.meaning)}</span></li>`).join('')}</ul>`:''}<div class="vl-answer-actions">${difficult.length?'<button class="vl-primary" data-all-action="retry">Ôn lại từ khó</button>':''}<button class="${difficult.length?'':'vl-primary'}" data-all-action="restart">Làm lại từ đầu</button></div></section>`;return;
    }
    const word=current();let type=questionType();
    if(type==='listen'&&!window.speechSynthesis)type='write';
    if((type==='meaning'||type==='korean')&&!options)options=optionsFor(word,type);
    if((type==='meaning'||type==='korean')&&!options)type='write';
    effectiveType=type;const useChoice=type==='meaning'||type==='korean';
    const prompt=type==='meaning'?`<h2 class="vl-prompt" lang="ko">${escapeHtml(word.word)}</h2><p>Chọn nghĩa tiếng Việt</p>`:type==='korean'?`<h2 class="vl-prompt">${escapeHtml(word.meaning)}</h2><p>Chọn từ tiếng Hàn</p>`:type==='write'?`<h2 class="vl-prompt">${escapeHtml(word.meaning)}</h2><p>Viết từ tiếng Hàn</p>`:`<button data-all-action="listen" ${response?'disabled':''}>◖)) Nghe từ mẫu</button><p>Nghe và viết lại bằng Hangul</p>`;
    const choices=useChoice?`<div class="vl-choices">${options.map(item=>`<button data-all-answer="${escapeHtml(type==='meaning'?item.meaning:item.word)}" ${response?'disabled':''}>${escapeHtml(type==='meaning'?item.meaning:item.word)}</button>`).join('')}</div>`:`<form class="all-review-form"><label class="sr-only" for="all-review-input">Đáp án tiếng Hàn</label><input id="all-review-input" lang="ko" autocomplete="off" placeholder="Nhập tiếng Hàn…" ${response?'disabled':''}><button class="vl-primary" ${response?'disabled':''}>Kiểm tra</button></form>`;
    const feedback=response?`<div class="vl-feedback ${response.ok?'vl-feedback-success':'all-review-incorrect'}" role="status">${response.ok?'✓ Đúng rồi!':'Chưa đúng.'} <span lang="ko">${escapeHtml(word.word)}</span> — ${escapeHtml(word.meaning)}</div>${response.ok?'':'<button class="vl-primary" data-all-action="next">Tiếp tục</button>'}`:'<button class="text-button all-review-skip" data-all-action="skip">Chưa nhớ</button>';
    const progress=retry?`Ôn lại từ khó · ${retryPosition+1}/${retryWords.length}`:`Chặng ${Math.floor(position/10)+1}/${chapters} · Từ ${position+1}/${total}`;
    host.innerHTML=`<section class="vl-practice all-review"><div class="vl-session-meta"><span>Ôn tất cả</span><span>${progress}</span></div><div class="vl-meter"><span style="width:${(retry?retryPosition/retryWords.length:position/total)*100}%"></span></div>${prompt}${choices}${feedback}${retry?'<button class="text-button all-review-finish" data-all-action="finish">Kết thúc ôn từ khó</button>':''}</section>`;
  }
  host.onclick=event=>{
    const answer=event.target.closest('[data-all-answer]');if(answer){submit(answer.dataset.allAnswer);return;}
    const action=event.target.closest('[data-all-action]')?.dataset.allAction;if(!action)return;
    if(action==='start'||action==='continue'){chapterWrong.clear();startQuestion();}
    if(action==='next')next();
    if(action==='skip')submit('',true);
    if(action==='listen')playAudio(current(),2);
    if(action==='finish'){clearPending();phase='done';render();}
    if(action==='retry'){clearPending();retry=true;round++;retryWords=shuffle(words.filter(w=>wrong.has(w.id)));retryPosition=0;startQuestion();}
    if(action==='restart'){clearPending();order=shuffle(words);position=0;retry=false;wrong.clear();chapterWrong.clear();round=0;startQuestion();}
  };
  host.onsubmit=event=>{if(!event.target.matches('.all-review-form'))return;event.preventDefault();const value=event.target.querySelector('input').value.trim();if(value)submit(value);};
  render();
  return {dispose(){disposed=true;clearPending();host.onclick=null;host.onsubmit=null;}};
}
