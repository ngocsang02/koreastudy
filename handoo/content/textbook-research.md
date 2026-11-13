# Đối chiếu Tiếng Hàn Tổng Hợp theo mục lục Excel

Ngày tra cứu: 12/11/2026. Mốc đối chiếu: `Mục lục Ngữ pháp - 6 Quyển THTH.xlsx`. Người dùng chưa xác định bản in, yêu cầu dùng mục lục này trước.

## Cập nhật từ PDF trong `document_korea` · 13/11/2026

- Quyển 1: PDF sách chính bản sửa đổi `개정판-본책`, 3쇄. Đã lấy `기본 어휘` và `새 단어` ở 15 bài; Bài 1 có 55 mục tại trang in 32–33 và 50.
- Quyển 2–6: đã đọc các PDF sách chính do người dùng cung cấp. Mỗi quyển có 15 bài; lấy các nhóm từ vựng cơ bản/theo chủ đề, phần mở rộng nếu có, và danh sách `새 단어` cuối bài. Giữ trang in và nhãn nhóm của sách. Nghĩa tiếng Việt được trích theo lớp chữ PDF; những dòng không ghép được thành cặp Hàn–Việt đầy đủ được lược khỏi dữ liệu.
- Workbook Quyển 2: vẫn giữ một nhóm riêng lấy từ phần bài tập `어휘 및 표현` trong `workbook_2.pdf`. Workbook không có danh sách từ mới riêng; nghĩa tiếng Việt của nhóm này được biên soạn theo ngữ cảnh bài tập, không giới thiệu là danh sách chính thức của sách chính.
- Tình trạng trên web: PDF sách chính và workbook có nhãn nguồn riêng. Các mục tuyển chọn 360 từ ban đầu vẫn còn làm nội dung bổ sung; chúng không được gộp vào danh sách đã trích PDF.
- Phần nghiên cứu dưới đây ghi lại đối chiếu trước đó với một bản scan 378 trang. Nó là tư liệu lịch sử và không còn là nguồn dữ liệu hiện dùng cho Bài 1 Quyển 1.

## Nguồn chính thức

| Quyển | Cấp học | Trang KF |
|---|---|---|
| 1 | Sơ cấp 1 | https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9827&p_cidx=2067 |
| 2 | Sơ cấp 2 | https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=2254&p_cidx=2068 |
| 3 | Trung cấp 3 | https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9826&p_cidx=2069 |
| 4 | Trung cấp 4 | https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9825&p_cidx=2070 |
| 5 | Cao cấp 5 | https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=9824&p_cidx=2071 |
| 6 | Cao cấp 6 | https://www.kf.or.kr/archives/book/book_view.do?p_cfidx=2173&p_cidx=2072 |

Đã đối chiếu thứ tự 15 bài mỗi quyển trên danh sách bài giảng KF với 90 bài Excel. Các chủ đề tương ứng sau khi chuẩn hóa khoảng trắng, hậu tố (1)/(2). Hai lỗi nhãn cần ghi nhận: Excel bài 2.2 ghi `역속` thay vì `약속`; danh sách video KF bài 2.10 ghi `외무`, trong khi chủ đề Excel là `외모` (ngoại hình). Không dùng một lỗi tên trên trang danh mục để sửa sai nội dung sách.

Đây là xác minh **mục lục**, chưa phải xác minh toàn bộ danh sách từ của 90 bài. Ngày hiển thị trong kho KF là ngày mục lưu trữ, không mặc định là năm xuất bản của bản PDF.

## Phiên bản và nguồn kiểm tra trang

Metadata tải của KF hiện ghi quyển 1 là `개정판-본책` (bản sửa đổi, sách chính). Các lượt tải qua endpoint hiện tại đã trả tệp rỗng. Đã tìm và đọc một bản PDF scan gốc KB/KF có 378 trang được Kanata lưu:

https://tudien.kanata.edu.vn/upload/files/Ebook%20GT%20Tieng%20Han%20Tong%20Hop%20-%20So%20Cap%201%20.pdf

Không kết luận đây chính là bản sửa đổi đang được KF niêm yết chỉ vì tên bài trùng nhau. MCBooks cũng có bản phát hành mới; số trang và từ cụ thể cần đối chiếu theo bản in:

https://giaotrinhtienghansarang.mcbooks.vn/

## Phát hiện từ sách thực tế

- Phần `기본 어휘` đầu bài: chia theo các nhóm chủ đề, tương ứng các nhãn ở cột D Excel.
- Phần `새 단어` cuối bài: các từ mới xuất hiện thêm trong nội dung và bài tập, không chỉ là từ cơ bản đầu bài.
- Vì vậy, muốn học và ôn đầy đủ theo sách phải thu thập cả hai phần và giữ thông tin phần sách, trang in, thứ tự xuất hiện.

## Phạm vi đã đối chiếu trực tiếp trong bản scan cũ · ghi nhận ngày 12/11/2026

Quyển 1, bài 1 `소개`, bản scan 378 trang:

| Phần | Trang in | Trang PDF | Số mục |
|---|---|---|---|
| Quốc gia | 32 | 33 | 16 |
| Nghề nghiệp | 33 | 34 | 10 |
| Lời chào | 33 | 34 | 6 |
| Từ mới cuối bài | 50 | 51 | 24 |
| Tổng | | | 56 |

56 mục là số đếm của bản scan cũ, không phải mọi hình thái từ xuất hiện trong toàn bộ hội thoại. Sau khi nhận PDF sách chính bản sửa đổi trong `document_korea`, Bài 1 hiện dùng 55 mục ở trang in 32–33 và 50; dữ liệu đang lưu tại `textbook-lesson-1-1.json`. Nghĩa Việt được diễn đạt ngắn gọn; gợi ý sử dụng và ví dụ trên web được biên soạn riêng.

Ghi chú ngày 12/11/2026 về 89 bài chưa đối chiếu là mốc lịch sử; trạng thái dữ liệu hiện tại đã được cập nhật sau khi đọc các PDF local trong `document_korea`. Bộ 4 mục/bài biên soạn trước đó vẫn là phần bổ sung, không thay thế danh sách từ lấy từ sách.

## Quy tắc nhập dữ liệu tiếp theo

1. Chọn và ghi rõ bản sách của từng quyển, không trộn bản gốc và bản sửa đổi mà không đánh dấu.
2. Với mỗi bài, nhập đủ phần từ cơ bản và phần từ mới; giữ nguyên nhóm và thứ tự của sách.
3. Đối chiếu chữ Hàn trực tiếp với trang sách, không chấp nhận OCR chưa kiểm tra. Bản scan quyển 1 không có lớp text, nên trích xuất text đơn thuần trả rỗng.
4. Mỗi mục lưu `sourceUrl`, `printedPage`, `section`, `verificationStatus`. Chỉ gắn nhãn đã đối chiếu khi đã thực sự kiểm tra.
5. Giữ ID mục đã có để không làm lệch tiến độ; mục thêm mới dùng ID mới.

Kho KF ghi điều kiện sử dụng riêng trên trang nguồn. Báo cáo này không thay thế điều kiện đó hoặc xác nhận quyền tái bản toàn bộ sách, hình minh họa, bài tập hay bản dịch. Website không đóng gói PDF scan; liên kết nguồn được cung cấp để đối chiếu.
