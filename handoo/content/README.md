# Biên tập từ vựng Hanul

> Cập nhật 13/11/2026: Đã trích các phần từ vựng theo chủ đề/cơ bản và `새 단어` cuối bài từ PDF sách chính của cả 6 quyển, đủ 15 bài mỗi quyển; giữ trang in và phân loại theo mục trong sách. Quyển 2 có thêm nhóm riêng từ bài tập `어휘 및 표현` trong PDF workbook; nghĩa của nhóm workbook do Hanul biên soạn theo ngữ cảnh. Xem [báo cáo đối chiếu giáo trình](textbook-research.md).

Các phần bên dưới mô tả bộ tuyển chọn 360 mục ban đầu. Bộ này vẫn được giữ làm nội dung bổ sung; các mục đã trích từ PDF được gắn trạng thái, phần sách, trang in và nguồn riêng ngay trong dữ liệu.

## Phạm vi

360 mục (từ, cụm từ, thành ngữ hoặc tục ngữ), 4 mục cốt lõi cho mỗi bài trong 90 bài. Tất cả 263 nhóm ở cột D của Excel có ít nhất một mục. “360 mục” tính theo lần xuất hiện trong bài, không phải 360 từ duy nhất: từ như `도서관` được ôn lại ở ngữ cảnh khác.

Danh sách được tuyển chọn và biên soạn bổ sung theo mục lục của người dùng, không chép hoặc tự nhận là danh sách từ chính thức của bộ Tiếng Hàn Tổng Hợp. Đây là bộ từ khởi đầu để mở rộng; mỗi nhóm chưa phải danh sách đầy đủ.

Tiêu đề Hàn của bài 2.2 được sửa khi hiển thị từ lỗi gõ `역속` trong Excel thành `약속` (cuộc hẹn). File Excel và dữ liệu ngữ pháp gốc không bị sửa; `originalTopic` giữ nhãn cũ trong catalog được sinh ra.

## Cách biên soạn

- Quyển 1–2: ưu tiên tình huống giao tiếp hằng ngày, lời chào, địa điểm, hoạt động và biểu đạt thường gặp.
- Quyển 3–4: từ về học tập, đời sống, công việc; đưa vào cụm dùng tự nhiên và nghĩa thành ngữ.
- Quyển 5–6: tăng từ trừu tượng, thuật ngữ xã hội, văn hóa, kinh tế, khoa học và ngôn ngữ. Cấp học gắn với quyển, không gắn nhãn TOPIK cho từng từ.
- Nghĩa Việt chọn theo ngữ cảnh bài. Không coi bản dịch một từ là toàn bộ các nghĩa của nó.
- Ví dụ và bản dịch được biên soạn riêng, không lấy nguyên câu ví dụ từ điển. Nội dung y học, kinh tế, chính trị là ví dụ ngôn ngữ, không phải hướng dẫn chuyên môn.
- Các mục văn hóa tránh khái quát tất cả người Hàn có cùng một đặc điểm.

## Nguồn tham khảo đã tra cứu

- [Từ điển Hàn–Việt NIKL](https://krdict.korean.go.kr/vie/mainAction): tham chiếu hệ thống từ điển cho người học và các phạm trù chủ đề.
- [Nuri Sejong · Korean language learning](https://nuri.iksi.or.kr/front/cms/contents/layout2/learningkorean/detail.do?csCmsMastrSeq=15358&language=ko&menuSn=664): tham chiếu cách gắn từ vựng với tình huống đời sống.
- [Korea University · Curriculum](https://klceng.korea.ac.kr/klceng/course/online_Korean_curriculum.do): định hướng chuyển từ sinh hoạt cơ bản sang chủ đề trừu tượng ở cấp cao.
- [NIKL · 민주주의](https://krdict.korean.go.kr/kor/dicSearch/SearchView?ParaWordNo=15777): đối chiếu nghĩa danh từ trong bài chính trị.
- [NIKL · 전세](https://krdict.korean.go.kr/kor/dicSearch/SearchView?ParaWordNo=25310): đối chiếu mục nhà ở.
- [UNESCO · Jongmyo Shrine](https://whc.unesco.org/en/list/738/): đối chiếu tên di sản ở bài 6.5.

Không ghi rằng toàn bộ 360 mục đã được kiểm chứng từng mục qua một API từ điển. Liên kết NIKL được cung cấp để người học tra thêm nghĩa, phát âm và cách dùng.

## Mở rộng

Sửa `vocabulary.tsv`, thêm từ vào **cuối bài** để không thay ID cũ. Header giữ nguyên thứ tự nhóm từ Excel. Chạy `pnpm data:vocabulary`, `pnpm test`, `pnpm build`. Nếu phải đổi hoặc sắp xếp ID, cần migration tiến độ đã có.
