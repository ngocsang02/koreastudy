import { BRAND_NAME } from './brand.js';
import { renderWorkbookPractice } from './workbook-practice.js';
import { createVocabularyLesson } from './lesson-vocabulary.js';
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const vocabulary = window.HANUL_VOCABULARY;
  const lessons = vocabulary.lessons;
  const grammar = window.HANUL_DATA.items.map(x => ({...x,type:'grammar',title:x.grammar}));
  const words = vocabulary.words.map(x => ({...x,type:'vocabulary',title:x.word}));
  const all = [...grammar,...words];
  const byId = new Map(all.map(x=>[x.id,x]));
  const byLesson = new Map(lessons.map(l=>[l.id,l]));
  const levels = ['Sơ cấp 1','Sơ cấp 2','Trung cấp 1','Trung cấp 2','Cao cấp 1','Cao cấp 2'];
  const bookDescriptions = ['Làm quen, chào hỏi và giao tiếp hằng ngày.','Mở rộng giao tiếp, kể trải nghiệm và lên kế hoạch.','Diễn đạt ý kiến trong học tập và cuộc sống.','Hiểu các tình huống xã hội và công việc.','Thảo luận về văn hóa, truyền thông và kinh tế.','Khám phá ngôn ngữ học thuật và vấn đề xã hội.'];
  const progress = window.hanulProgress;
  let state = progress.snapshot(), saved = new Set(state.saved), learned = new Set(state.learned);
  let route = {name:'home'}, search = '', typeFilter = 'all', bookFilter = '', statusFilter = '', page = 1, category = '', vocabularySource = '';
  let theoryVocabBook = '1', theoryGrammarBook = 'all';
  let detailId = null, detailOrder = [], reviewType = 'vocabulary', reviewScope = 'all', reviewItems = [], reviewIndex = 0, revealed = false;
  let toastTimer;
  let vocabularyLessonController=null;
  let lessonNavOpen = true;
  const expandedWords = new Set();
  const index = new Map(all.map(x=>[x.id,norm([x.title,x.note||'',x.meaning||'',x.example||'',x.translation||'',x.categoryTitle||'',byLesson.get(x.lesson).title,x.topic].join(' '))]));
  const lessonItems = id => all.filter(x=>x.lesson===id);
  const completion = items => ({done:items.filter(x=>learned.has(x.id)).length,total:items.length});
  const noteHTML = text => esc(text).split('\n').map(line=>`<span class="${/[가-힣]/.test(line)?'korean':''}">${line}</span>`).join('\n');
  const chapter = l => Number(l.id.split('.')[1]);
  const locationLabel = x => `Quyển ${x.book} · Bài ${chapter(byLesson.get(x.lesson))} · ${byLesson.get(x.lesson).title}`;
  function toast(text) { $('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600); }
  function go(hash) { if(location.hash==='#'+hash) render(); else location.hash=hash; }
  function toggle(field,id) {
    const s=new Set(saved),l=new Set(learned);const set=field==='saved'?s:l;
    set.has(id)?set.delete(id):set.add(id);
    progress.update([...s],[...l]);
    if(field==='learned')toast(set.has(id)?'Đã đánh dấu là đã học.':'Đã chuyển về chưa học.');
  }
  function readRoute() {
    const parts=location.hash.slice(1).split('/');
    if(parts[0]==='book'&&/^[1-6]$/.test(parts[1]))return {name:'book',book:parts[1],tab:parts[2]==='grammar'?'grammar':'vocabulary'};
    if(parts[0]==='lesson'&&byLesson.has(parts[1]))return {name:'lesson',lesson:parts[1],tab:parts[2]==='grammar'?'grammar':'vocabulary'};
    if(parts[0]==='workbook'&&parts[1]==='1')return {name:parts[2]==='practice'?'workbook-practice':'workbook',book:'1'};
    if(['search','saved','review','grammar-review','vocabulary','grammar','theory'].includes(parts[0]))return {name:parts[0]};
    return {name:'home'};
  }
  function crumb(text,href) {return href?`<a href="#${href}">${esc(text)}</a>`:`<span class="current">${esc(text)}</span>`;}
  function updateNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el=>{const active=el.dataset.nav===(['book','lesson','workbook','workbook-practice','vocabulary','grammar'].includes(route.name)?'theory':route.name==='grammar-review'?'review':route.name);el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    $('saved-count').textContent=saved.size;
    let crumbs=route.name==='book'
      ?[crumb('Lý thuyết','theory'),crumb(`${route.tab==='grammar'?'Ngữ pháp':'Từ vựng'} Quyển ${route.book}`)]
      :route.name==='lesson'
        ?[crumb('Lý thuyết','theory'),crumb(route.tab==='grammar'?'Ngữ pháp':'Từ vựng',route.tab)]
        :[crumb('Khóa học',route.name==='home'?null:'home')];
    if(route.name==='lesson'){const l=byLesson.get(route.lesson);crumbs.push(crumb('Quyển '+l.book+' · '+levels[Number(l.book)-1],'book/'+l.book+'/'+route.tab),crumb('Bài '+chapter(l)+' · '+l.title));}
    if(route.name==='workbook-practice')crumbs=[crumb('Lý thuyết','theory'),crumb('Workbook Quyển 1','workbook/1'),crumb('Bài 01')];
    if(route.name==='workbook')crumbs=[crumb('Lý thuyết','theory'),crumb('Workbook Quyển 1')];
    if(route.name==='search')crumbs=[crumb('Tra cứu từ vựng & ngữ pháp')];
    if(route.name==='saved')crumbs=[crumb('Nội dung đã lưu')];
    if(route.name==='review')crumbs=[crumb('Ôn tập từ vựng')];
    if(route.name==='grammar-review')crumbs=[crumb('Ôn ngữ pháp')];
    if(route.name==='vocabulary')crumbs=[crumb('Học từ vựng')];
    if(route.name==='grammar')crumbs=[crumb('Học ngữ pháp')];
    if(route.name==='theory')crumbs=[crumb('Lý thuyết')];
    $('breadcrumbs').innerHTML=crumbs.join('<span class="crumb-divider" aria-hidden="true">/</span>');
  }
  function introHTML() {
    return `<section class="intro-hero"><div class="intro-copy"><span class="intro-kicker">HỌC TIẾNG HÀN CÙNG ${esc(BRAND_NAME.toUpperCase())}</span><h1>Mỗi ngày một chút,<br><em>tiếng Hàn gần hơn.</em></h1><p>${esc(BRAND_NAME)} giúp bạn học từ vựng và ngữ pháp theo 6 quyển Tiếng Hàn Tổng Hợp. Chọn quyển phù hợp, học từng bài và theo dõi những gì bạn đã nắm được.</p><div class="intro-actions"><a class="button button-primary" href="#theory">Khám phá lý thuyết <span aria-hidden="true">→</span></a><a class="button button-outline" href="#book/1/vocabulary">Bắt đầu quyển 1</a></div></div><div class="intro-visual" aria-hidden="true"><div class="intro-orbit orbit-one"></div><div class="intro-orbit orbit-two"></div><div class="intro-card intro-card-word"><small>TỪ VỰNG</small><strong lang="ko">안녕하세요</strong><span>Xin chào!</span></div><div class="intro-card intro-card-grammar"><small>NGỮ PHÁP</small><strong lang="ko">-고 싶다</strong><span>Muốn làm gì đó</span></div><div class="intro-spark">✦</div></div></section><section class="intro-section"><div class="section-heading"><div><span class="intro-kicker">BẠN SẼ HỌC GÌ?</span><h2>Một lộ trình đơn giản để bắt đầu</h2><p>Đi từ kiến thức cơ bản đến nâng cao, theo đúng quyển sách bạn đang học.</p></div></div><div class="intro-feature-grid"><a href="#theory" class="intro-feature"><span class="feature-icon">가</span><h3>Từ vựng theo quyển</h3><p>Tìm từ mới theo bài, xem nghĩa tiếng Việt, ví dụ và nghe phát âm.</p><span class="feature-link">Xem từ vựng →</span></a><a href="#theory" class="intro-feature"><span class="feature-icon">文</span><h3>Ngữ pháp dễ tra cứu</h3><p>Đọc cách dùng và ví dụ của từng cấu trúc trong 6 quyển.</p><span class="feature-link">Xem ngữ pháp →</span></a><a href="#review" class="intro-feature"><span class="feature-icon">↻</span><h3>Ôn tập theo tiến độ</h3><p>Đánh dấu mục đã học, lưu kiến thức cần nhớ và quay lại luyện tập.</p><span class="feature-link">Bắt đầu ôn tập →</span></a></div></section>`;
  }
  function theoryHTML() {
    const choices = (selected,all=false) => `${all?`<option value="all" ${selected==='all'?'selected':''}>Tất cả quyển</option>`:''}${levels.map((level,i)=>`<option value="${i+1}" ${selected===String(i+1)?'selected':''}>Quyển ${i+1} · ${level}</option>`).join('')}`;
    const vocabItems=words.filter(x=>x.book===theoryVocabBook),vc=completion(vocabItems);
    const grammarBooks=theoryGrammarBook==='all'?[1,2,3,4,5,6]:[Number(theoryGrammarBook)];
    return `<div class="theory-heading"><span class="intro-kicker">THƯ VIỆN HỌC TẬP</span><h1>Lý thuyết</h1><p>Chọn quyển để học từ vựng, ngữ pháp và luyện tập theo từng bài.</p></div><section class="theory-section" aria-labelledby="vocabulary-title"><div class="theory-section-head"><div><h2 id="vocabulary-title">Từ vựng</h2><p>Học từ mới trong ngữ cảnh của từng bài.</p></div><select id="theory-vocab-book" aria-label="Chọn quyển từ vựng">${choices(theoryVocabBook)}</select></div><div class="theory-card-grid"><a class="theory-card" href="#book/${theoryVocabBook}/vocabulary"><span class="theory-icon" aria-hidden="true">Aa</span><span class="theory-card-copy"><strong>Từ vựng Quyển ${theoryVocabBook}</strong><small>${levels[Number(theoryVocabBook)-1]} · 15 bài học</small><span class="theory-progress">✓ <span>${vc.done}/${vc.total} đã học</span></span></span><span class="theory-arrow" aria-hidden="true">→</span></a><a class="theory-card theory-review-card" href="#review"><span class="theory-icon" aria-hidden="true">↻</span><span class="theory-card-copy"><strong>Ôn lại từ vựng</strong><small>Luyện những từ bạn đã học và lưu lại</small><span class="theory-progress">Mở phần ôn tập</span></span><span class="theory-arrow" aria-hidden="true">→</span></a></div></section><section class="theory-section" aria-labelledby="grammar-title"><div class="theory-section-head"><div><h2 id="grammar-title">Ngữ pháp</h2><p>Chọn một quyển để xem các cấu trúc và ví dụ.</p></div><select id="theory-grammar-book" aria-label="Chọn quyển ngữ pháp">${choices(theoryGrammarBook,true)}</select></div><div class="theory-card-grid">${grammarBooks.map(n=>{const group=grammar.filter(x=>x.book===String(n)),c=completion(group);return `<a class="theory-card" href="#book/${n}/grammar"><span class="theory-icon grammar-icon" aria-hidden="true">ABC</span><span class="theory-card-copy"><strong>Ngữ pháp Quyển ${n}</strong><small>${levels[n-1]} · 15 bài học</small><span class="theory-progress">✓ <span>${c.done}/${c.total} đã học</span></span></span><span class="theory-arrow" aria-hidden="true">→</span></a>`;}).join('')}</div></section><section class="theory-section" aria-labelledby="workbook-title"><div class="theory-section-head"><div><h2 id="workbook-title">Workbook</h2><p>Làm bài tập từ vựng, ngữ pháp và các kỹ năng theo sách bài tập.</p></div></div><div class="theory-card-grid"><a class="theory-card" href="#workbook/1"><span class="theory-icon workbook-icon" aria-hidden="true">✎</span><span class="theory-card-copy"><strong>Workbook Quyển 1</strong><small>Sơ cấp 1 · 15 bài · Có mục lục và trình đọc PDF</small><span class="theory-progress">Mở sách bài tập →</span></span><span class="theory-arrow" aria-hidden="true">→</span></a></div></section>`;
  }
  function workbookHTML(){
    const chapters=[['Hangeul','Tiếng Hàn và chữ Hangeul',7],['Bài 01','Giới thiệu',15],['Bài 02','Trường học',23],['Bài 03','Sinh hoạt hàng ngày',33],['Bài 04','Ngày và thứ',41],['Bài 05','Công việc trong ngày',49],['Bài 06','Cuối tuần',59],['Bài 07','Mua sắm (1)',69],['Bài 08','Thức ăn',77],['Bài 09','Nhà cửa',84],['Bài 10','Gia đình',92],['Bài 11','Thời tiết',102],['Bài 12','Điện thoại (1)',111],['Bài 13','Sinh nhật',118],['Bài 14','Sở thích',125],['Bài 15','Giao thông (1)',134],['Đáp án','Đáp án',144]];
    return `<section class="workbook-page"><div class="workbook-heading"><div><span class="intro-kicker">SÁCH BÀI TẬP · SƠ CẤP 1</span><h1>Workbook Quyển 1</h1><p><a href="#workbook/1/practice">Làm bài tập tương tác Bài 01 →</a></p><p>Luyện từ vựng, ngữ pháp và kỹ năng nghe, nói, đọc, viết. Chọn bài để mở đúng trang trong sách.</p></div><a class="button button-outline" href="/workbooks/workbook_1.pdf" download>↓ Tải PDF</a></div><div class="workbook-layout"><nav class="workbook-toc" aria-label="Mục lục Workbook Quyển 1"><h2>Mục lục</h2><p>Chọn một phần để chuyển đến trang tương ứng.</p>${chapters.map(([label,title,pdfPage])=>`<a href="#page=${pdfPage}" data-workbook-page="${pdfPage}"><span>${esc(label)}</span><strong>${esc(title)}</strong><span aria-hidden="true">↗</span></a>`).join('')}</nav><section class="workbook-reader" aria-label="Trình đọc Workbook Quyển 1"><div class="workbook-reader-bar"><strong>Tiếng Hàn Tổng Hợp · Sách bài tập</strong><a href="/workbooks/workbook_1.pdf#page=15" target="_blank" rel="noopener noreferrer">Mở trong tab mới ↗</a></div><iframe id="workbook-pdf" title="Workbook Quyển 1, sách bài tập PDF" src="/workbooks/workbook_1.pdf#page=15&view=FitH"></iframe><p class="workbook-reader-note">Nếu trình duyệt không hiển thị PDF, hãy dùng nút tải xuống để mở bằng ứng dụng đọc PDF.</p></section></div></section>`;
  }
  function bookHTML() {
    const b=route.book,bookLessons=lessons.filter(l=>l.book===b);
    if(route.tab==='vocabulary'){
      const bookOptions=levels.map((name,i)=>`<option value="${i+1}" ${b===String(i+1)?'selected':''}>Quyển ${i+1} · ${name}</option>`).join('');
      return `<section class="vocabulary-book-page"><div class="vocabulary-book-head"><h1>Từ vựng Quyển ${b}</h1><div class="vocabulary-book-actions"><select class="book-switcher" id="book-switcher" aria-label="Chọn quyển từ vựng">${bookOptions}</select><a class="button button-outline vocabulary-test-button" href="#review">Kiểm tra</a></div></div><div class="vocabulary-lesson-grid">${bookLessons.map(l=>{const items=words.filter(x=>x.lesson===l.id),c=completion(items);return `<a href="#lesson/${l.id}/vocabulary" class="vocabulary-lesson-card" aria-label="Bài ${chapter(l)}: ${esc(l.title)}, ${items.length} từ"><span class="vocabulary-card-icon" aria-hidden="true"><span>Aa</span></span><span class="vocabulary-card-copy"><strong>Bài ${chapter(l)}: ${esc(l.title)}</strong><small>${items.length} từ${c.done?` · ${c.done} đã học`:''}</small></span>${c.done===c.total&&c.total?'<span class="vocabulary-card-done" aria-label="Đã học xong">✓</span>':''}</a>`;}).join('')}</div></section>`;
    }
    const bookOptions=levels.map((name,i)=>`<option value="${i+1}" ${b===String(i+1)?'selected':''}>Quyển ${i+1} · ${name}</option>`).join('');
    return `<section class="grammar-book-page"><div class="vocabulary-book-head"><h1>Ngữ pháp Quyển ${b}</h1><div class="vocabulary-book-actions"><select class="book-switcher" id="book-switcher" aria-label="Chọn quyển ngữ pháp">${bookOptions}</select></div></div><div class="vocabulary-lesson-grid grammar-lesson-grid">${bookLessons.map(l=>{const items=grammar.filter(x=>x.lesson===l.id),c=completion(items);return `<a href="#lesson/${l.id}/grammar" class="vocabulary-lesson-card grammar-lesson-card" aria-label="Bài ${chapter(l)}: ${esc(l.title)}, ${items.length} cấu trúc ngữ pháp"><span class="vocabulary-card-icon grammar-card-icon" aria-hidden="true"><span>文</span></span><span class="vocabulary-card-copy"><strong>Bài ${chapter(l)}: ${esc(l.title)}</strong><small>${items.length} cấu trúc${c.done?` · ${c.done} đã học`:''}</small></span>${c.done===c.total&&c.total?'<span class="vocabulary-card-done" aria-label="Đã học xong">✓</span>':''}</a>`;}).join('')}</div></section>`;
  }
  function trackHTML(type){
    const isWord=type==='vocabulary',items=isWord?words:grammar;
    return `<div class="track-heading"><div class="eyebrow">${isWord?'TỪNG TỪ, TỪNG NGỮ CẢNH':'HIỂU CÁCH DÙNG, TẬP ĐẶT CÂU'}</div><h1>${isWord?'Học từ vựng':'Học ngữ pháp'}</h1><p>${isWord?'Chọn quyển và bài. Từ vựng hiển thị gọn; bấm vào từ để mở cách dùng, nguồn và ví dụ.':'Chọn quyển và bài. Mỗi cấu trúc có phần giải thích và ví dụ từ ghi chú Excel của bạn.'}</p><div class="detail-actions"><a href="#${isWord?'review':'grammar-review'}" class="button button-primary">${isWord?'Đến lịch ôn từ vựng':'Ôn các cấu trúc đã học'} →</a><a href="#${isWord?'grammar':'vocabulary'}" class="text-button">${isWord?'Chuyển sang học ngữ pháp':'Chuyển sang học từ vựng'} ↗</a></div></div><div class="book-grid">${[1,2,3,4,5,6].map(n=>{const group=items.filter(x=>x.book===String(n)),c=completion(group);return `<article class="book-card" data-tone="${Math.ceil(n/2)}"><div class="book-top"><div class="book-cover">${n}</div><span class="level-label">${levels[n-1]}</span></div><h3>Quyển ${n}</h3><p>${bookDescriptions[n-1]}</p><div class="book-facts"><span>15 bài</span><span>· ${group.length} ${isWord?'mục từ':'cấu trúc'}</span></div><div class="book-progress"><span style="width:${Math.round(c.done/c.total*100)}%"></span></div><div class="book-progress-label"><span>${c.done}/${c.total} đã học</span><span>${Math.round(c.done/c.total*100)}%</span></div><a class="button button-outline" href="#book/${n}/${type}">Chọn bài ${isWord?'từ vựng':'ngữ pháp'} →</a></article>`;}).join('')}</div>`;
  }
  function saveButton(x) {return `<button class="save-button ${saved.has(x.id)?'selected':''}" data-save="${x.id}" aria-label="${saved.has(x.id)?'Bỏ lưu':'Lưu'} ${esc(x.title)}" aria-pressed="${saved.has(x.id)}">${saved.has(x.id)?'★':'☆'}</button>`;}
  function wordExplanation(x) {
    return `${x.usage?`<p class="word-usage">${esc(x.usage)}</p>`:''}${x.example?`<div class="word-example"><p lang="ko">${esc(x.example)}</p><small>${esc(x.translation)}</small></div>`:''}`;
  }
  function wordCard(x,showLocation=false) {
    const source=x.verificationStatus==='supplemental'?`TOPIK I bổ sung · ${BRAND_NAME} tuyển chọn theo chủ đề Quyển 1; chưa xác nhận có trong sách. Nghĩa, ví dụ và lưu ý do ${BRAND_NAME} biên soạn.`:x.verificationStatus==='verified'?`${x.section==='new'?'Từ mới cuối bài':x.section==='workbook'?'Bài tập từ vựng và biểu hiện':x.section==='extended'?'Từ vựng mở rộng':'Từ vựng cơ bản'} · trang ${x.printedPage} · ${x.sourceLabel}${x.section==='workbook'?' · nghĩa Việt biên soạn theo ngữ cảnh':''}`:'Chờ đối chiếu với giáo trình · Nội dung biên soạn trước đó';
    return `<details class="word-card compact-word" data-word="${x.id}" ${expandedWords.has(x.id)?'open':''}><summary class="word-summary"><span class="compact-korean" lang="ko">${esc(x.word)}</span><span class="compact-meaning">${esc(x.meaning)}${x.topikTrack?'<small class="topik-label">TOPIK I bổ sung</small>':showLocation&&x.verificationStatus==='pending'?'<small class="pending-label">Chờ đối chiếu sách</small>':''}</span><span class="expand-icon" aria-hidden="true">+</span></summary><div class="word-expanded">${showLocation?`<a class="result-location" href="#lesson/${x.lesson}/vocabulary">${esc(locationLabel(x))} ↗</a>`:''}<span class="pos">${esc(x.pos)}</span>${wordExplanation(x)}<p class="word-source">${esc(source)}${x.inspectionUrl?` · <a href="${esc(x.inspectionUrl)}" target="_blank" rel="noopener noreferrer">Trang sách PDF ↗</a>`:''}${x.sourceUrl?` · <a href="${esc(x.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(x.sourceLinkLabel||'Nguồn KF')} ↗</a>`:''}</p><div class="word-actions"><button class="audio-button" data-speak="${x.id}" aria-label="Nghe ${esc(x.word)}">◖ Nghe phát âm</button><div class="compact-actions">${saveButton(x)}<button class="learn-button ${learned.has(x.id)?'selected':''}" data-learn="${x.id}" aria-pressed="${learned.has(x.id)}">${learned.has(x.id)?'✓ Đã học':'+ Đánh dấu đã học'}</button></div></div></div></details>`;
  }
  function grammarCard(x,i,showLocation=false) {
    const excerpt=x.note.replace(/^\s*[-+•*]\s*/,'').replace(/\n+/g,' ').slice(0,170);
    return `<article class="grammar-compact-word compact-word">${showLocation?`<a class="result-location" href="#lesson/${x.lesson}/grammar">${esc(locationLabel(x))} ↗</a>`:''}<div class="grammar-card-layout"><button class="word-summary grammar-card-trigger" data-open="${x.id}" aria-label="Mở giải thích ${esc(x.grammar)}"><span class="compact-korean" lang="ko">${esc(x.grammar)}</span><span class="compact-meaning">${esc(excerpt)}</span><span class="expand-icon" aria-hidden="true">↗</span></button><div class="grammar-card-actions">${saveButton(x)}${learned.has(x.id)?'<span class="done-tag">✓ Đã học</span>':''}</div></div></article>`;
  }
  function lessonHTML() {
    const l=byLesson.get(route.lesson),siblings=lessons.filter(x=>x.book===l.book),isWord=route.tab==='vocabulary';const g=grammar.filter(x=>x.lesson===l.id),v=words.filter(x=>x.lesson===l.id);const c=completion(isWord?v:g);
    if(!isWord)return `<section class="grammar-only-page" aria-label="Các thẻ ngữ pháp"><div class="grammar-only-grid">${g.map((x,i)=>grammarCard(x,i)).join('')}</div></section>`;
    const n=chapter(l);const previous=siblings[n-2],next=siblings[n];
    let content;
    if(isWord){
      const visibleWords=v.filter(x=>!vocabularySource||(vocabularySource==='topik'?x.topikTrack:x.verificationStatus===vocabularySource));
      const categories=l.categories.map((ko,i)=>({ko,vi:l.categoryTitles[i]})).filter(c=>visibleWords.some(x=>x.category===c.ko));
      content=`${l.book==='1'?`<div class="topik-intro"><b>TOPIK I · Học thêm theo chủ đề bài này</b><p>12 mục tuyển chọn cho mỗi bài trong Quyển 1, có nghĩa, ví dụ và lưu ý cách dùng. Nhãn “TOPIK I bổ sung” không xác nhận từ có trong sách; đây là bộ khởi đầu, không phải toàn bộ từ vựng TOPIK I.</p></div>`:''}${l.vocabularyStatus==='verified'?`<div class="textbook-status verified"><b>Đã trích ${v.filter(x=>x.verificationStatus==='verified').length} mục từ PDF nguồn · Quyển ${l.book}</b><p>${esc(l.verificationScope||'Từ vựng lấy theo tài liệu nguồn của bài học.')}</p><a href="${esc(l.textbookUrl)}" target="_blank" rel="noopener noreferrer">Nguồn giáo trình KF ↗</a></div>`:`<div class="textbook-status pending"><b>Bài này chưa đối chiếu đủ từ vựng theo sách.</b><p>Từ có nhãn TOPIK I bổ sung là phần tuyển chọn riêng theo chủ đề. Những mục còn lại vẫn chờ đối chiếu; danh sách này chưa phải toàn bộ từ chính xác của bài trong sách.</p><a href="${esc(l.textbookUrl)}" target="_blank" rel="noopener noreferrer">Xem giáo trình quyển ${l.book} tại KF ↗</a></div>`}<div class="lesson-toolbar"><p>Bấm vào từ để mở giải thích, cách dùng và phát âm.</p><select id="vocabulary-source" class="topic-select" aria-label="Lọc nguồn từ vựng"><option value="">Tất cả nội dung</option><option value="topik" ${vocabularySource==='topik'?'selected':''}>TOPIK I bổ sung</option><option value="verified" ${vocabularySource==='verified'?'selected':''}>Đã trích từ PDF</option><option value="pending" ${vocabularySource==='pending'?'selected':''}>Nội dung cũ chờ đối chiếu</option></select><select id="category-filter" class="topic-select" aria-label="Lọc nhóm chủ đề"><option value="">Tất cả nhóm chủ đề</option>${categories.map(({ko,vi})=>`<option value="${esc(ko)}" ${category===ko?'selected':''}>${esc(vi)}</option>`).join('')}</select></div>${categories.filter(x=>!category||x.ko===category).map(({ko,vi})=>`<h2 class="group-heading">${esc(vi)} <span lang="ko">${esc(ko)}</span></h2><div class="vocab-grid">${visibleWords.filter(x=>x.category===ko).map(x=>wordCard(x)).join('')}</div>`).join('')}${!visibleWords.length?emptyHTML('Chưa có từ thuộc nguồn này.','Hãy chọn nguồn khác để xem từ vựng của bài.'):''}<p class="book-note">Danh sách được ghi rõ phần sách và trạng thái đối chiếu. <button class="text-button" data-sources>Về nội dung & nguồn tham khảo ↗</button></p>`;
    }
    return `<div class="learning-layout ${lessonNavOpen?'':'lesson-nav-collapsed'}"><aside class="lesson-sidebar" aria-label="Các bài trong quyển ${l.book}"><div class="sidebar-title"><div class="sidebar-book-label" ${lessonNavOpen?'':'hidden'}><b>Quyển ${l.book}</b><small>${levels[Number(l.book)-1]}</small></div><button class="lesson-menu-button" id="lesson-menu-button" aria-expanded="${lessonNavOpen}" aria-controls="lesson-menu-content" aria-label="${lessonNavOpen?'Thu gọn':'Mở'} danh sách bài" title="${lessonNavOpen?'Thu gọn':'Mở'} danh sách bài"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></div><div class="lesson-picker-content" id="lesson-menu-content" ${lessonNavOpen?'':'hidden'}><a class="all-lessons-link" href="#book/${l.book}/${route.tab}">Tất cả bài ↗</a><div class="sidebar-lessons">${siblings.map(s=>`<a style="text-decoration:none" class="sidebar-lesson ${s.id===l.id?'active':''}" href="#lesson/${s.id}/${route.tab}" ${s.id===l.id?'aria-current="page"':''}><span>${String(chapter(s)).padStart(2,'0')}</span>${esc(s.title)}</a>`).join('')}</div></div></aside><section class="lesson-main"><div class="lesson-heading"><div class="eyebrow">QUYỂN ${l.book} · ${levels[Number(l.book)-1]} · BÀI ${n}/15</div><h1>${esc(l.title)}</h1><p lang="ko">${esc(l.topic)}</p><p class="lesson-intro">Học từ mới trước, xem cách dùng ngữ pháp sau. Bấm “Đã học” để lưu tiến độ.</p><div class="lesson-progress"><span>${c.done}/${c.total} mục đã học</span><div class="track" aria-hidden="true"><span style="width:${Math.round(c.done/c.total*100)}%"></span></div></div></div><div class="content-tabs" aria-label="Nội dung bài học"><a style="text-decoration:none" class="content-tab ${isWord?'active':''}" href="#lesson/${l.id}/vocabulary" ${isWord?'aria-current="page"':''}>Từ vựng <small>${v.length}</small></a><a style="text-decoration:none" class="content-tab ${!isWord?'active':''}" href="#lesson/${l.id}/grammar" ${!isWord?'aria-current="page"':''}>Ngữ pháp <small>${g.length}</small></a><button class="content-tab" data-review-lesson="${l.id}">Ôn bài này ↗</button></div>${content}<div class="lesson-bottom">${previous?`<a class="button button-outline" href="#lesson/${previous.id}/${route.tab}">← Bài ${chapter(previous)}</a>`:`<a class="button button-outline" href="#book/${l.book}/${route.tab}">← Chọn bài</a>`}<a class="back-book" href="#book/${l.book}/${route.tab}">Xem 15 bài trong quyển ${l.book}</a>${next?`<a class="button button-primary" href="#lesson/${next.id}/${route.tab}">Bài ${chapter(next)} tiếp theo →</a>`:`<a class="button button-primary" href="#home">Chọn quyển tiếp theo →</a>`}</div></section></div>`;
  }
  function searchHTML(isSaved=false) {
    return `<div class="search-heading"><h1>${isSaved?'Để dành, rồi học tiếp.':'Bạn đang muốn tìm gì?'}</h1><p>${isSaved?'Từ vựng và ngữ pháp bạn đã lưu đều ở đây.':'Tìm bằng tiếng Hàn hoặc tiếng Việt, cả trong nghĩa và câu ví dụ.'}</p></div><div class="search-panel"><label class="search-field"><span aria-hidden="true">⌕</span><input id="search-input" type="search" value="${esc(search)}" placeholder="Ví dụ: gia đình, 학교, 지요…" aria-label="Tìm từ vựng hoặc ngữ pháp"></label><select class="search-select" id="type-filter" aria-label="Loại nội dung"><option value="all">Từ vựng & ngữ pháp</option><option value="vocabulary">Từ vựng</option><option value="grammar">Ngữ pháp</option></select><select class="search-select" id="search-book" aria-label="Lọc quyển"><option value="">Tất cả quyển</option>${levels.map((_,i)=>`<option value="${i+1}">Quyển ${i+1}</option>`).join('')}</select><select class="search-select" id="status-filter" aria-label="Trạng thái học"><option value="">Mọi trạng thái</option><option value="unlearned">Chưa học</option><option value="learned">Đã học</option></select></div><div id="search-results"></div>`;
  }
  function getResults() {const q=norm(search.trim());return all.filter(x=>(route.name!=='saved'||saved.has(x.id))&&(!q||index.get(x.id).includes(q))&&(typeFilter==='all'||typeFilter===x.type)&&(!bookFilter||x.book===bookFilter)&&(!statusFilter||(statusFilter==='learned'?learned.has(x.id):!learned.has(x.id))));}
  function emptyHTML(title,message,link='home',label='Chọn bài để học') {return `<div class="empty-state"><div class="empty-symbol" aria-hidden="true">▤</div><h3>${esc(title)}</h3><p>${esc(message)}</p><a class="button button-outline" href="#${link}">${esc(label)} →</a></div>`;}
  function renderResults() {
    const list=getResults();const pages=Math.max(1,Math.ceil(list.length/12));page=Math.min(page,pages);
    $('search-results').innerHTML=`<div class="result-meta"><span>${list.length} kết quả${search?' phù hợp':''}</span><span>Trang ${page}/${pages}</span></div><div class="result-grid">${list.slice((page-1)*12,page*12).map((x,i)=>x.type==='vocabulary'?wordCard(x,true):grammarCard(x,i,true)).join('')||emptyHTML(route.name==='saved'?'Bạn chưa lưu nội dung phù hợp.':'Chưa tìm thấy nội dung.','Thử từ khóa khác hoặc bỏ bớt bộ lọc. Bấm ngôi sao ở mỗi mục để lưu lại.')}</div>${pages>1?`<div class="pagination"><button data-page="${page-1}" ${page===1?'disabled':''} aria-label="Trang trước">←</button><span>${page} / ${pages}</span><button data-page="${page+1}" ${page===pages?'disabled':''} aria-label="Trang sau">→</button></div>`:''}`;
  }
  function prepareReview() {
    reviewItems=all.filter(x=>x.type===reviewType&&(reviewScope==='saved'?saved.has(x.id):reviewScope.startsWith('lesson:')?x.lesson===reviewScope.slice(7):reviewScope.startsWith('book:')?x.book===reviewScope.slice(5):true));
    for(let i=reviewItems.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[reviewItems[i],reviewItems[j]]=[reviewItems[j],reviewItems[i]];}
    reviewIndex=0;revealed=false;
  }
  function reviewHTML() {
    return `<section class="review-layout"><div class="search-heading"><h1>Ôn một chút, nhớ lâu hơn.</h1><p>Nhìn từ hoặc cấu trúc, tự nhớ nghĩa trước khi xem đáp án.</p></div><div class="review-options"><label>Nội dung<select class="search-select" id="review-type"><option value="vocabulary">Từ vựng</option><option value="grammar">Ngữ pháp</option></select></label><label>Phạm vi<select class="search-select" id="review-scope"><option value="all">Tất cả bài</option><option value="saved">Nội dung đã lưu</option>${route.lesson?`<option value="lesson:${route.lesson}">Bài ${esc(route.lesson)} · ${esc(byLesson.get(route.lesson).title)}</option>`:''}${levels.map((l,i)=>`<option value="book:${i+1}">Quyển ${i+1} · ${l}</option>`).join('')}</select></label><button class="button button-outline" id="shuffle-review">Trộn thẻ ↻</button></div><div id="flashcard-area"></div></section>`;
  }
  function renderFlashcard() {
    if(!reviewItems.length){$('flashcard-area').innerHTML=emptyHTML('Chưa có thẻ để ôn.','Chọn phạm vi khác hoặc lưu nội dung bạn muốn ôn.');return;}
    const x=reviewItems[reviewIndex],l=byLesson.get(x.lesson);
    $('flashcard-area').innerHTML=`<article class="flashcard"><div class="flashcard-front"><small>QUYỂN ${x.book} · BÀI ${chapter(l)} · ${esc(l.title)}</small><h2 lang="ko">${esc(x.title)}</h2>${x.type==='vocabulary'&&x.verificationStatus==='pending'?'<p class="pending-label">Từ biên soạn trước đó · Chưa đối chiếu sách</p>':''}<p>${x.type==='vocabulary'?'Từ này có nghĩa gì? Bạn có thể đặt một câu không?':'Cấu trúc này dùng khi nào? Bạn nhớ cách dùng không?'}</p>${!revealed?'<button class="button button-primary" id="reveal-answer">Xem đáp án →</button>':`<button class="audio-button" style="margin:auto" data-speak="${x.id}">◖ Nghe phát âm</button>`}</div>${revealed?`<div class="flash-answer">${x.type==='vocabulary'?`<h3>${esc(x.meaning)}</h3>${wordExplanation(x)}`:`<div class="note-content">${noteHTML(x.note)}</div>`}</div><div class="flash-actions"><button class="button button-outline" id="review-again">Cần ôn thêm →</button><button class="button button-primary" id="review-known">✓ Đã nhớ · Thẻ tiếp</button></div>`:''}</article><p class="review-progress">Thẻ ${reviewIndex+1} / ${reviewItems.length} · Bạn có thể học theo tốc độ của mình.</p>`;
  }
  function render() {
    $('screen').setAttribute('aria-busy','false');
    vocabularyLessonController?.dispose();vocabularyLessonController=null;
    updateNavigation();
    if(route.name==='lesson'&&route.tab==='vocabulary'){
      vocabularyLessonController=createVocabularyLesson($('screen'),byLesson.get(route.lesson),words.filter(w=>w.lesson===route.lesson),progress);return;
    }
    if(route.name==='review'&&window.hanulReview){window.hanulReview.render($('screen'),{lesson:route.lesson});return;}
    if(route.name==='workbook-practice'){renderWorkbookPractice($('screen'));return;}
    if(route.name==='vocabulary'||route.name==='grammar'){$('screen').innerHTML=trackHTML(route.name);return;}
    $('screen').innerHTML=route.name==='home'?introHTML():route.name==='theory'?theoryHTML():route.name==='workbook'?workbookHTML():route.name==='book'?bookHTML():route.name==='lesson'?lessonHTML():(route.name==='review'||route.name==='grammar-review')?reviewHTML():searchHTML(route.name==='saved');
    if(route.name==='theory'){
      $('theory-vocab-book').onchange=e=>{theoryVocabBook=e.target.value;render();};
      $('theory-grammar-book').onchange=e=>{theoryGrammarBook=e.target.value;render();};
    }
    if(route.name==='lesson'&&$('lesson-menu-button'))$('lesson-menu-button').onclick=()=>{lessonNavOpen=!lessonNavOpen;render();$('lesson-menu-button').focus();};
    if(route.name==='book')$('book-switcher').onchange=e=>go('book/'+e.target.value+'/'+route.tab);
    if(route.name==='lesson'&&route.tab==='vocabulary'){
      $('category-filter').onchange=e=>{category=e.target.value;render();};
      $('vocabulary-source').onchange=e=>{vocabularySource=e.target.value;category='';render();};
    }
    if(['search','saved'].includes(route.name)){
      $('type-filter').value=typeFilter;$('search-book').value=bookFilter;$('status-filter').value=statusFilter;
      $('search-input').oninput=e=>{search=e.target.value;page=1;renderResults();};
      $('type-filter').onchange=e=>{typeFilter=e.target.value;page=1;renderResults();};
      $('search-book').onchange=e=>{bookFilter=e.target.value;page=1;renderResults();};
      $('status-filter').onchange=e=>{statusFilter=e.target.value;page=1;renderResults();};
      renderResults();
    }
    if(route.name==='grammar-review'||route.name==='review'){
      if(route.name==='grammar-review')$('review-type').innerHTML='<option value="grammar">Ngữ pháp</option>';
      $('review-type').value=reviewType;$('review-scope').value=reviewScope;
      $('review-type').onchange=e=>{reviewType=e.target.value;prepareReview();renderFlashcard();};
      $('review-scope').onchange=e=>{reviewScope=e.target.value;prepareReview();renderFlashcard();};
      $('shuffle-review').onclick=()=>{prepareReview();renderFlashcard();};
      renderFlashcard();
    }
  }
  function speak(x) {
    if(!('speechSynthesis'in window)){toast('Thiết bị này chưa hỗ trợ đọc thành tiếng.');return;}
    const voices=speechSynthesis.getVoices();
    const voice=voices.find(v=>v.lang.toLowerCase().startsWith('ko'));
    if(voices.length&&!voice){toast('Thiết bị chưa có giọng Hàn. Hãy cài giọng ko-KR để nghe.');return;}
    speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(x.title);utterance.lang='ko-KR';if(voice)utterance.voice=voice;utterance.rate=.8;utterance.onerror=()=>toast('Chưa phát được giọng Hàn trên thiết bị này.');speechSynthesis.speak(utterance);
  }
  function openDetail(id,order) {
    const x=byId.get(id);if(!x)return;
    if(order)detailOrder=order;detailId=id;
    $('detail').classList.toggle('grammar-detail',x.type==='grammar');
    $('detail-meta').textContent=x.type==='grammar'?`${x.title} - ${x.meaning||''}`:locationLabel(x);
    $('detail-category').textContent=x.type==='vocabulary'?x.categoryTitle+' · '+x.pos:'NGỮ PHÁP';
    $('detail-title').textContent=x.title;$('detail-subtitle').textContent=x.meaning||'';
    $('detail-content').innerHTML=x.type==='vocabulary'?`<h3 class="note-heading">Dùng từ trong câu</h3><div class="detail-example"><p lang="ko">${esc(x.example)}</p><small>${esc(x.translation)}</small></div><p class="body-copy">Thử thay một chi tiết trong câu để nói về bản thân bạn.</p>`:`<h3 class="note-heading">Cách dùng & ví dụ</h3><div class="note-content">${noteHTML(x.note)}</div>`;
    $('detail-source').textContent=x.type==='vocabulary'?`Từ vựng mở rộng theo chủ đề · Nghĩa và ví dụ do ${BRAND_NAME} biên soạn. Tra cứu thêm trong mục Nguồn tham khảo.`:`Nguồn: ${window.HANUL_DATA.source} · ${window.HANUL_DATA.sheet}!${x.id}`;
    $('detail-save').textContent=saved.has(id)?'★ Đã lưu':'☆ Lưu để ôn';$('detail-save').setAttribute('aria-pressed',saved.has(id));
    $('detail-learn').textContent=learned.has(id)?'✓ Đã học · Bỏ đánh dấu':'+ Đánh dấu đã học';$('detail-learn').setAttribute('aria-pressed',learned.has(id));
    const i=detailOrder.indexOf(id);$('detail-position').textContent=`${i+1} / ${detailOrder.length}`;$('prev-detail').disabled=i<=0;$('next-detail').disabled=i>=detailOrder.length-1;
    if(!$('detail').open)$('detail').showModal();
  }
  function detailList() {return ['search','saved'].includes(route.name)?getResults().map(x=>x.id):route.name==='lesson'?all.filter(x=>x.lesson===route.lesson&&x.type===route.tab&&(!category||x.type==='grammar'||x.category===category)).map(x=>x.id):all.map(x=>x.id);}
  function showSources() {$('sources-dialog').showModal();}
  document.addEventListener('toggle',e=>{
    const id=e.target.dataset?.word;
    if(id)e.target.open?expandedWords.add(id):expandedWords.delete(id);
  },true);
  $('editorial-note').textContent=vocabulary.editorialNote;
  $('source-links').innerHTML=vocabulary.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`).join('');
  $('open-sources').onclick=showSources;$('close-sources').onclick=()=>$('sources-dialog').close();
  $('close-detail').onclick=()=>$('detail').close();
  $('detail-save').onclick=()=>toggle('saved',detailId);$('detail-learn').onclick=()=>toggle('learned',detailId);$('detail-speak').onclick=()=>speak(byId.get(detailId));
  $('prev-detail').onclick=()=>{openDetail(detailOrder[detailOrder.indexOf(detailId)-1]);$('detail').scrollTop=0;};
  $('next-detail').onclick=()=>{openDetail(detailOrder[detailOrder.indexOf(detailId)+1]);$('detail').scrollTop=0;};
  document.addEventListener('click',e=>{
    const workbookLink=e.target.closest('[data-workbook-page]');if(workbookLink){e.preventDefault();const pageNumber=workbookLink.dataset.workbookPage;$('workbook-pdf').src=`/workbooks/workbook_1.pdf#page=${pageNumber}&view=FitH`;document.querySelectorAll('[data-workbook-page]').forEach(link=>link.removeAttribute('aria-current'));workbookLink.setAttribute('aria-current','page');return;}
    const button=e.target.closest('button');if(!button)return;
    if(button.dataset.nav){search='';typeFilter='all';bookFilter='';statusFilter='';page=1;if(button.dataset.nav==='review'){reviewScope='all';prepareReview();}go(button.dataset.nav);}
    else if(button.dataset.open)openDetail(button.dataset.open,detailList());
    else if(button.dataset.save)toggle('saved',button.dataset.save);
    else if(button.dataset.learn)toggle('learned',button.dataset.learn);
    else if(button.dataset.speak)speak(byId.get(button.dataset.speak));
    else if(button.dataset.page){page=Number(button.dataset.page);renderResults();$('search-results').scrollIntoView({block:'start'});}
    else if(button.hasAttribute('data-sources'))showSources();
    else if(button.dataset.reviewLesson){const id=button.dataset.reviewLesson;reviewScope='lesson:'+id;reviewType=route.tab;prepareReview();go((route.tab==='grammar'?'grammar-review/':'review/')+id);}
    else if(button.id==='reveal-answer'){revealed=true;renderFlashcard();}
    else if(button.id==='review-again'||button.id==='review-known'){
      const id=reviewItems[reviewIndex].id;const nextLearned=new Set(learned);button.id==='review-known'?nextLearned.add(id):nextLearned.delete(id);progress.update([...saved],[...nextLearned]);
      const isEnd=reviewIndex===reviewItems.length-1;reviewIndex=(reviewIndex+1)%reviewItems.length;revealed=false;renderFlashcard();if(isEnd)toast('Bạn đã ôn hết lượt này. Thẻ sẽ bắt đầu lại.');
    }
  });
  function navigate() {
    const old=route;route=readRoute();
    if(route.name==='review'||route.name==='grammar-review'){
      if(route.name==='grammar-review')reviewType='grammar';
      const id=location.hash.split('/')[1];if(id&&byLesson.has(id)){route.lesson=id;reviewScope='lesson:'+id;}else if(reviewScope.startsWith('lesson:'))reviewScope='all';
      if(old.name!==route.name||old.lesson!==route.lesson)prepareReview();
    }
    if(route.name==='lesson'){
      if(old.lesson!==route.lesson)category='';
      try{localStorage.setItem('hanul-last-lesson',route.lesson);}catch{}
    }
    if($('detail').open)$('detail').close();render();window.scrollTo({top:0,behavior:'instant'});
  }
  $('skip-content').onclick=e=>{e.preventDefault();$('workspace').focus({preventScroll:true});$('workspace').scrollIntoView({block:'start'});};
  window.addEventListener('hashchange',()=>{navigate();$('workspace').focus({preventScroll:true});});
  progress.subscribe(next=>{
    const changed=next.userId!==state.userId||JSON.stringify(next.saved)!==JSON.stringify(state.saved)||JSON.stringify(next.learned)!==JSON.stringify(state.learned);
    const userChanged=next.userId!==state.userId;state=next;saved=new Set(next.saved);learned=new Set(next.learned);
    if(changed){if(route.name!=='review'&&route.name!=='grammar-review')render();else{updateNavigation();if(userChanged){if(route.name==='review'&&window.hanulReview)window.hanulReview.render($('screen'),{lesson:route.lesson});else{prepareReview();renderFlashcard();}}}if($('detail').open&&detailId)openDetail(detailId);}
  });
  navigate();
})();

