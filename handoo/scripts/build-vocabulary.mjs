import { BRAND_NAME } from '../src/brand.js';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('src/data.js',root),'utf8'),context);
const grammar=context.window.HANUL_DATA.items;
const catalog=new Map();
for(const x of grammar){if(!catalog.has(x.lesson))catalog.set(x.lesson,{id:x.lesson,book:x.book,topic:x.topic,categories:[],grammarIds:[]});const l=catalog.get(x.lesson);l.grammarIds.push(x.id);if(x.vocabulary&&!l.categories.includes(x.vocabulary))l.categories.push(x.vocabulary);}
// Correct a clear spelling error for display without modifying the Excel source.
catalog.get('2.2').originalTopic = catalog.get('2.2').topic;
catalog.get('2.2').topic = '약속';
let current,counts={};const words=[];
for(const raw of fs.readFileSync(new URL('content/vocabulary.tsv',root),'utf8').split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  const parts=line.split('|');
  if(line.startsWith('@')){const[id,title,categories]=parts;current=catalog.get(id.slice(1));if(!current)throw Error('Unknown lesson '+id);current.title=title;current.categoryTitles=categories.split(';');if(current.categoryTitles.length!==current.categories.length)throw Error('Category mismatch '+id);continue;}
  if(!current||parts.length!==6)throw Error('Invalid vocabulary row: '+line);
  const[word,meaning,pos,index,example,translation]=parts;const categoryIndex=Number(index);
  if(!current.categories[categoryIndex])throw Error('Invalid category '+line);
  const n=counts[current.id]=(counts[current.id]||0)+1;
  words.push({id:`V${current.id.replace('.','-')}-${n}`,book:current.book,lesson:current.id,topic:current.topic,category:current.categories[categoryIndex],categoryTitle:current.categoryTitles[categoryIndex],word,meaning,pos,example,translation});
}
for(const l of catalog.values()){
 if(!l.title||!counts[l.id])throw Error('Missing lesson '+l.id);
 for(const category of l.categories)if(!words.some(x=>x.lesson===l.id&&x.category===category))throw Error('Uncovered category '+l.id+': '+category);
}
const output={lessons:[...catalog.values()],words,sources:[{title:'Từ điển Hàn–Việt · Viện Quốc ngữ Quốc gia Hàn Quốc',url:'https://krdict.korean.go.kr/vie/mainAction'},{title:'Nuri Sejong · Học từ vựng theo tình huống',url:'https://nuri.iksi.or.kr/front/cms/contents/layout2/learningkorean/detail.do?csCmsMastrSeq=15358&language=ko&menuSn=664'},{title:'Korea University · Định hướng chủ đề theo cấp học',url:'https://klceng.korea.ac.kr/klceng/course/online_Korean_curriculum.do'}],editorialNote:'Từ vựng bổ sung do ' + BRAND_NAME + ' tuyển chọn theo chủ đề trong file Excel. Nghĩa và ví dụ được biên soạn cho việc tự học; không phải danh sách từ vựng chính thức hay đầy đủ của giáo trình.',updatedAt:'2026-11-13'};
const textbookSources=[
  {book:'1',url:'https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9827&p_cidx=2067'},
  {book:'2',url:'https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=2254&p_cidx=2068'},
  {book:'3',url:'https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9826&p_cidx=2069'},
  {book:'4',url:'https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9825&p_cidx=2070'},
  {book:'5',url:'https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9824&p_cidx=2071'},
  {book:'6',url:'https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=2173&p_cidx=2072'}
];
for(const l of catalog.values()){
  l.textbookUrl=textbookSources.find(x=>x.book===l.book).url;
  l.vocabularyStatus='pending';
}
for(const w of words)w.verificationStatus='pending';
// Manually inspected against printed pages. Preserve IDs already used for progress.
const verified=JSON.parse(fs.readFileSync(new URL('content/textbook-lesson-1-1.json',root),'utf8'));
const old=words.filter(x=>x.lesson===verified.lesson);
const canonical=x=>x.replace(/[?.]/g,'').trim();
let serial=Math.max(...old.map(x=>Number(x.id.split('-').at(-1))));
const inspected=[];
const l=catalog.get(verified.lesson);
for(const group of verified.groups){
  if(!l.categories.includes(group.category)){l.categories.push(group.category);l.categoryTitles.push(group.categoryTitle);}
  for(const [word,meaning,usage] of group.entries){
    const previous=old.find(x=>canonical(x.word)===canonical(word));
    inspected.push({id:previous?.id||`V1-1-${++serial}`,book:'1',lesson:l.id,topic:l.topic,category:group.category,categoryTitle:group.categoryTitle,word,meaning,pos:previous?.pos||(group.category==='인사말'?'Lời chào':group.section==='new'?'Từ / cụm từ':'Danh từ'),example:previous?.example||'',translation:previous?.translation||'',usage:usage||group.usage||'',verificationStatus:'verified',section:group.section,printedPage:group.printedPage,sourceUrl:verified.officialUrl,inspectionUrl:verified.inspectionCopy?verified.inspectionCopy+'#page='+(group.printedPage+1):undefined,sourceLabel:verified.sourceLabel});
  }
}
words.splice(0,words.length,...inspected,...words.filter(x=>x.lesson!==verified.lesson));
l.vocabularyStatus='verified';l.verificationScope=verified.scope;
// Vocabulary transcribed from the user's revised Book 1 main-text PDF.
// The PDF has an extractable text layer; retain printed pages and section labels.
const extractedBook1=JSON.parse(fs.readFileSync(new URL('content/textbook-book1-vocabulary.json',root),'utf8'));
for(const sourceLesson of extractedBook1.lessons){
 const target=catalog.get(sourceLesson.lesson);
 if(!target||target.book!=='1')throw Error('Invalid extracted textbook lesson '+sourceLesson.lesson);
 const existing=words.filter(x=>x.lesson===target.id);
 let serial=Math.max(0,...existing.map(x=>Number(x.id.split('-').at(-1))));
 const seen=new Set();
 for(const [section,entries,pages] of [
   ['basic',sourceLesson.basic,sourceLesson.basicPrintedPages],
   ['new',sourceLesson.new,[sourceLesson.newPrintedPage]]
 ]){
  const category=section==='basic'?'기본 어휘':'새 단어';
  const categoryTitle=section==='basic'?'Từ vựng cơ bản':'Từ mới trong bài';
  if(!target.categories.includes(category)){target.categories.push(category);target.categoryTitles.push(categoryTitle);}
  for(const [word,meaning,printedPage] of entries){
   const key=word.replace(/[?.]/g,'').trim();
   if(seen.has(key))continue;
   seen.add(key);
   const previous=existing.find(x=>x.word.replace(/[?.]/g,'').trim()===key);
   const entry={id:previous?.id||`V1-${target.id.split('.')[1]}-${++serial}`,book:'1',lesson:target.id,topic:target.topic,category,categoryTitle,word,meaning,pos:previous?.pos||'Mục từ giáo trình',example:previous?.example||'',translation:previous?.translation||'',verificationStatus:'verified',section,printedPage,sourceLabel:extractedBook1.sourceLabel,sourceUrl:extractedBook1.sourceUrl,sourceLinkLabel:'Korea Foundation · nguồn giáo trình'};
   if(previous?.topikTrack)entry.topikTrack=true;
   const at=words.findIndex(x=>x.id===entry.id);
   if(at>=0)words[at]=entry;else words.push(entry);
  }
 }
 target.vocabularyStatus='verified';
 target.verificationScope='Đã trích từ lớp văn bản PDF bản chính 3쇄: Từ vựng cơ bản và Từ mới cuối bài. Trang in được giữ cho từng mục; bản dịch theo sách.';
}
// Independent editorial TOPIK I selection. A match is not evidence of textbook membership.
catalog.get('1.1').categories.push('개인 정보');
catalog.get('1.1').categoryTitles.push('Thông tin cá nhân');
let supplementLesson;
const supplementCounts={};
for(const raw of fs.readFileSync(new URL('content/topik1-book1.tsv',root),'utf8').split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  if(line.startsWith('@')){supplementLesson=catalog.get(line.slice(1));if(!supplementLesson||supplementLesson.book!=='1')throw Error('Invalid TOPIK lesson '+line);continue;}
  const parts=line.split('|');
  if(!supplementLesson||parts.length!==7||parts.some(x=>!x))throw Error('Invalid TOPIK row '+line);
  const [word,meaning,pos,index,example,translation,usage]=parts;
  const categoryIndex=Number(index),lesson=supplementLesson.id;
  if(!supplementLesson.categories[categoryIndex])throw Error('Invalid TOPIK category '+line);
  const n=supplementCounts[lesson]=(supplementCounts[lesson]||0)+1;
  const previous=words.find(x=>x.lesson===lesson&&canonical(x.word)===canonical(word));
  if(previous?.topikTrack)throw Error('Duplicate TOPIK word '+lesson+' '+word);
  if(previous?.verificationStatus==='verified'){previous.topikTrack=true;continue;}
  const entry={id:previous?.id||`V1-${lesson.split('.')[1]}-${1000+n}`,book:'1',lesson,topic:supplementLesson.topic,category:supplementLesson.categories[categoryIndex],categoryTitle:supplementLesson.categoryTitles[categoryIndex],word,meaning,pos,example,translation,usage,verificationStatus:'supplemental',topikTrack:true,section:'topik',sourceLabel:'' + BRAND_NAME + ' · TOPIK I bổ sung theo chủ đề Quyển 1',sourceUrl:'https://krdict.korean.go.kr/vie/mainAction',sourceLinkLabel:'Từ điển Hàn–Việt NIKL',researchUrl:'https://www.niied.go.kr/convert/preview/1764492440543/index.html'};
  if(previous)Object.assign(previous,entry);else words.push(entry);
}
for(let n=1;n<=15;n++)if(supplementCounts[`1.${n}`]!==12)throw Error('Expected 12 TOPIK entries for lesson '+n);
// Book 2 source is the user's workbook PDF. Keep its exercise words distinct from a textbook glossary.
const extractedBook2=JSON.parse(fs.readFileSync(new URL('content/textbook-book2-workbook-vocabulary.json',root),'utf8'));
for(const sourceLesson of extractedBook2.lessons){
 const target=catalog.get(sourceLesson.lesson);
 if(!target||target.book!=='2')throw Error('Invalid extracted workbook lesson '+sourceLesson.lesson);
 const existing=words.filter(x=>x.lesson===target.id);
 let serial=Math.max(0,...existing.map(x=>Number(x.id.split('-').at(-1))));
 const category='어휘 및 표현',categoryTitle='Từ vựng trong bài tập workbook';
 if(!target.categories.includes(category)){target.categories.push(category);target.categoryTitles.push(categoryTitle);}
 const seen=new Set();
 for(const [word,meaning,printedPage] of sourceLesson.entries){
  const key=word.replace(/[?.]/g,'').trim();
  if(seen.has(key))continue;
  seen.add(key);
  const previous=existing.find(x=>x.word.replace(/[?.]/g,'').trim()===key);
  const entry={id:previous?.id||`V2-${target.id.split('.')[1]}-${++serial}`,book:'2',lesson:target.id,topic:target.topic,category,categoryTitle,word,meaning,pos:previous?.pos||'Từ/cụm từ trong workbook',example:previous?.example||'',translation:previous?.translation||'',verificationStatus:'verified',section:'workbook',printedPage,sourceLabel:extractedBook2.sourceLabel,sourceUrl:extractedBook2.sourceUrl,sourceLinkLabel:'Korea Foundation · nguồn giáo trình'};
  const at=words.findIndex(x=>x.id===entry.id);
  if(at>=0)words[at]=entry;else words.push(entry);
 }
 target.vocabularyStatus='verified';
 target.verificationScope=extractedBook2.scope;
}
// Main-text PDFs for Books 2–6 use the same section-aware source treatment as Book 1.
// Workbook 2 remains a separate source group above.
const extractedBooks2to6=JSON.parse(fs.readFileSync(new URL('content/textbook-book2-6-vocabulary.json',root),'utf8'));
for(const sourceBook of extractedBooks2to6.books){
 for(const sourceLesson of sourceBook.lessons){
  const target=catalog.get(sourceLesson.lesson);
  if(!target||target.book!==sourceBook.book)throw Error('Invalid extracted main textbook lesson '+sourceLesson.lesson);
  const existing=words.filter(x=>x.lesson===target.id);
  let serial=Math.max(0,...existing.map(x=>Number(x.id.split('-').at(-1))));
  const ensureCategory=(category,title)=>{
   let key=category;
   let at=target.categories.indexOf(key);
   if(at>=0&&target.categoryTitles[at]!==title){key=`${category} · PDF`;at=target.categories.indexOf(key);}
   if(at<0){target.categories.push(key);target.categoryTitles.push(title);}
   return key;
  };
  const addEntries=(entries,section,baseCategory,baseTitle,pos)=>{
   const category=ensureCategory(baseCategory,baseTitle);
   const seen=new Set();
   for(const [word,meaning,printedPage] of entries){
    if(!meaning?.trim())continue;
    const key=word.replace(/[?.]/g,'').trim();
    if(seen.has(key))continue;
    seen.add(key);
    const previous=existing.find(x=>x.section===section&&x.word.replace(/[?.]/g,'').trim()===key);
    const entry={id:previous?.id||`V${sourceBook.book}-${target.id.split('.')[1]}-${++serial}`,book:sourceBook.book,lesson:target.id,topic:target.topic,category,categoryTitle:baseTitle,word,meaning,pos:previous?.pos||pos,example:previous?.example||'',translation:previous?.translation||'',verificationStatus:'verified',section,printedPage,sourceLabel:sourceBook.sourceLabel,sourceUrl:sourceBook.sourceUrl,sourceLinkLabel:'Korea Foundation · giáo trình'};
    const at=words.findIndex(x=>x.id===entry.id);
    if(at>=0)words[at]=entry;else words.push(entry);
   }
  };
  for(const group of sourceLesson.basic){
   const section=group.kind==='extended'?'extended':'basic';
   const categoryTitle=group.categoryTitle|| (section==='extended'?'Từ vựng mở rộng':'Từ vựng theo chủ đề');
   addEntries(group.entries,section,group.category,categoryTitle,section==='extended'?'Từ vựng mở rộng':'Từ vựng theo chủ đề');
  }
  addEntries(sourceLesson.new,'new','새 단어','Từ mới cuối bài','Từ mới trong giáo trình');
  target.vocabularyStatus='verified';
  target.verificationScope=sourceBook.scope;
 }
}
output.topikSelection={count:Object.values(supplementCounts).reduce((a,b)=>a+b,0),scope:'Bộ khởi đầu luyện TOPIK I: 12 mục mỗi bài, theo 15 chủ đề Quyển 1. Không phải toàn bộ từ vựng TOPIK I và không xác nhận từ có trong sách.',researchDate:'2026-11-12'};
output.textbookSources=textbookSources;
output.editorialNote='Quyển 1–6: từ vựng cơ bản/theo chủ đề và từ mới cuối bài được trích từ PDF sách chính theo từng bài, có trang in; nghĩa được lấy từ lớp chữ của sách. Quyển 2 còn có một nhóm riêng lấy từ bài tập 어휘 및 표현 của PDF workbook; workbook không có danh mục từ mới riêng, nghĩa nhóm này được biên soạn theo ngữ cảnh bài tập. Từ vựng TOPIK I là bộ bổ sung biên soạn riêng, không xác nhận thuộc sách.';
output.sources=[...textbookSources.map(x=>({title:`Korea Foundation · Giáo trình quyển ${x.book}`,url:x.url})),{title:'Từ điển Hàn–Việt NIKL · Tra cứu nghĩa',url:'https://krdict.korean.go.kr/vie/mainAction'}];
output.sources.push({title:'Workbook quyển 2 · PDF nguồn phần 어휘 및 표현',url:extractedBook2.sourceUrl});
output.sources.push({title:'NIIED · Mô tả năng lực TOPIK I (tài liệu K-HED 2021)',url:'https://www.niied.go.kr/convert/preview/1764492440543/index.html'},{title:'NIKL · Phân loại chủ đề và tình huống sơ cấp',url:'https://krdict.korean.go.kr/kor/dicSearch/searchDetailActCategory'});
output.editorialNote+=' Có thêm bộ khởi đầu 180 mục luyện TOPIK I theo 15 chủ đề Quyển 1, do ' + BRAND_NAME + ' tuyển chọn và biên soạn nghĩa, ví dụ, lưu ý; có thể trùng từ trong sách nhưng chưa xác nhận trang sách thì không gắn nhãn đã đối chiếu. Đây không phải toàn bộ từ vựng TOPIK I.';
fs.writeFileSync(new URL('src/vocabulary.js',root),'window.HANUL_VOCABULARY = '+JSON.stringify(output,null,2)+';\n');
console.log(`${catalog.size} lessons, ${words.length} vocabulary entries, ${[...catalog.values()].reduce((n,l)=>n+l.categories.length,0)} categories covered.`);
