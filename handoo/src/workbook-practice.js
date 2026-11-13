export function renderWorkbookPractice(container) {
  const groups = [
    {title:'Từ vựng · Chọn từ khác nhóm', questions:[
      ['공무원 · 간호사 · 호주 · 주부',['공무원','간호사','호주','주부'],2],
      ['은행 · 학과 · 학생 · 학생증',['은행','학과','학생','학생증'],0],
      ['베트남 · 말레이시아 · 인도 · 선생님',['베트남','말레이시아','인도','선생님'],3],
      ['아니요 · 안녕하세요? · 안녕히 계세요 · 안녕히 가세요',['아니요','안녕하세요?','안녕히 계세요','안녕히 가세요'],0]
    ]},
    {title:'Ngữ pháp · Chọn 은 hoặc 는', questions:[
      ['저(　) 학생입니다.',['은','는'],1],['완 씨(　) 공무원입니다.',['은','는'],1],['제 이름(　) 김민준입니다.',['은','는'],0],['잔반두 씨(　) 주부입니다.',['은','는'],1],['이 사람(　) 풍 씨입니다.',['은','는'],0]
    ]},
    {title:'Đọc · Chọn câu phù hợp', questions:[
      ['뚜안 씨는 학생입니까?',['네, 뚜안입니다.','네, 학생입니다.'],1],
      ['이 사람은 루이엔 씨입니까?',['네, 저는 학생입니다.','아니요, 흐엉 씨입니다.'],1],
      ['안녕하세요? 저는 최정우입니다.',['안녕하세요? 저는 이유나 씨가 아닙니다.','반갑습니다. 제 이름은 히엔입니다.'],1],
      ['마이클 씨는 미국 사람입니까?',['네, 미국 사람입니까.','아니요, 호주 사람입니다.'],1]
    ]}
  ];
  let index=0;
  container.innerHTML=`<div class="theory-heading"><span class="intro-kicker">WORKBOOK 1 · BÀI 01</span><h1>Giới thiệu · 소개</h1><p>Chọn câu trả lời, sau đó kiểm tra kết quả.</p><a href="#workbook/1">← Quay lại Workbook</a></div><form id="workbook-practice">${groups.map(group=>`<section class="theory-section"><h2>${group.title}</h2>${group.questions.map(([prompt,options])=>{const n=index++;return `<fieldset class="workbook-question"><legend>${n+1}. <span lang="ko">${prompt}</span></legend>${options.map((option,i)=>`<label><input type="radio" name="q${n}" value="${i}"> <span lang="ko">${option}</span></label>`).join('')}<p id="workbook-feedback-${n}" aria-live="polite"></p></fieldset>`;}).join('')}</section>`).join('')}<button class="button button-primary" type="submit">Kiểm tra đáp án</button><p id="workbook-result" role="status"></p></form>`;
  container.querySelector('form').onsubmit=e=>{e.preventDefault();let correct=0,answered=0;groups.flatMap(g=>g.questions).forEach(([,options,answer],i)=>{const selected=container.querySelector(`input[name="q${i}"]:checked`);const feedback=container.querySelector(`#workbook-feedback-${i}`);if(!selected){feedback.textContent='Hãy chọn một đáp án.';return;}answered++;const right=Number(selected.value)===answer;if(right)correct++;feedback.textContent=right?'✓ Chính xác':`Chưa đúng. Đáp án: ${options[answer]}`;});container.querySelector('#workbook-result').textContent=`Đúng ${correct}/${answered} câu đã trả lời · Còn ${index-answered} câu chưa làm.`;};
}
