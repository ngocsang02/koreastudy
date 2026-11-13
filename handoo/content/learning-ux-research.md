# Thiết kế khu học và lịch ôn Hanul

Ngày tra cứu: 12/11/2026. Tài liệu phân biệt điều đã thấy ở sản phẩm khác, bằng chứng nghiên cứu và quyết định triển khai riêng của Hanul.

## Tham khảo sản phẩm

| Nguồn chính thức | Mẫu bố trí tham khảo | Áp dụng tại Hanul |
|---|---|---|
| [Busuu: Vocabulary Review](https://help.busuu.com/hc/en-gb/articles/16941990776593-How-can-I-review-my-vocabulary) và [Grammar Review](https://help.busuu.com/hc/en-gb/articles/12575469156242-How-can-I-review-my-grammar) | Hai khu ôn riêng; danh sách từ có nghĩa, audio và mở ví dụ; trạng thái từ yếu/trung bình/mạnh. Các chế độ cụ thể có thể khác theo nền tảng. | Tách lối vào Từ vựng và Ngữ pháp; hàng từ ngắn, bấm để mở; khu từ khó nhớ riêng. |
| [Duolingo: Practice tab](https://blog.duolingo.com/guide-to-duolingo-practice-hub/) | Một khu luyện riêng để tập kỹ năng hoặc ôn lỗi, có bài tập từ vựng và ghép từ với nghĩa. | Khu Ôn tập riêng, ưu tiên từ đến hạn và từ gặp khó khăn. |
| [Quizlet: Studying on Quizlet](https://help.quizlet.com/hc/en-ca/articles/360030841732-Studying-on-Quizlet) | Cùng một bộ nội dung được dùng qua thẻ, gõ đáp án, kiểm tra và hoạt động ghép. | Bốn chế độ: lật thẻ, gõ Hangul, chọn nghĩa, ghép cặp. |

Đây là tham khảo mẫu tương tác, không sao chép giao diện hoặc thuật toán riêng của các sản phẩm trên. Không kết luận rằng một tính năng của app điện thoại luôn có trên website cùng thương hiệu.

## Bằng chứng về trí nhớ

1. [Karpicke & Roediger (2008), Science](https://learninglab.psych.purdue.edu/downloads/2008/2008_Karpicke_Roediger_Science.pdf): thí nghiệm học từ ngoại ngữ cho thấy tiếp tục luyện tự nhớ lại sau lần trả lời đúng có ích cho khả năng nhớ trì hoãn. Áp dụng: ẩn đáp án trước; gõ từ hoặc tự nhớ nghĩa rồi mới nhận phản hồi.
2. [Cepeda và cộng sự (2008), Psychological Science](https://pubmed.ncbi.nlm.nih.gov/19076480/): khoảng nghỉ có lợi phụ thuộc khoảng thời gian muốn duy trì ký ức. Áp dụng: tránh khẳng định một chuỗi ngày là tối ưu cho mọi mục tiêu học.
3. [Karpicke & Bauernschmidt (2011)](https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Bauernschmidt_JEPLMC.pdf): trong thí nghiệm này, tổng độ giãn giữa các lần truy xuất quan trọng, còn lịch tăng dần không thể hiện ưu thế cố hữu so với lịch đều hoặc giảm dần. Áp dụng: ưu tiên ôn nhiều buổi và truy xuất chủ động; không quảng cáo chuỗi tăng dần của Hanul như một công thức khoa học duy nhất.

Không chuyển số liệu hiệu quả của một thí nghiệm cụ thể thành cam kết người dùng Hanul sẽ nhớ được một tỷ lệ hoặc một thời hạn nhất định.

## Quy tắc lịch ôn đang triển khai

Đây là **heuristic của sản phẩm**, chưa được hiệu chỉnh bằng dữ liệu người dùng; không phải FSRS/SM-2.

| Kết quả | Thời gian chờ đến lần tiếp theo | Thay đổi |
|---|---|---|
| Không nhớ / trả lời sai | 10 phút | Về bậc đầu, ghi nhận một lần quên |
| Nhớ chậm | 1 ngày | Lùi một bậc |
| Nhớ rõ / trả lời đúng | 1, 3, 7, 14, 30, 60, 120 ngày theo các lượt thành công; sau đó giữ 120 ngày | Tăng một bậc, tối đa bậc 7 |

Các số trên là **khoảng chờ giữa hai lượt**, không phải các mốc cộng dồn tính từ ngày học đầu. Ôn muộn không tự bị tính là sai; lịch mới tính từ thời điểm trả lời thực tế. Không ghi nhận thêm kết quả chỉ vì mở trang, lật thẻ hoặc tải lại.

Luyện thêm trước hạn vẫn ghi nhận lượt luyện, nhưng trả lời đúng sớm không tăng bậc hoặc đẩy ngày ôn xa hơn. Nhớ chậm không dời một lịch sớm đang có sang muộn hơn. Tránh biến việc lặp liên tục trong cùng ngày thành bằng chứng giả về ghi nhớ cách quãng.

“Đã học” chỉ ghi nhận đã tiếp xúc nội dung. Lịch ôn có lịch sử riêng: bậc, số lần ôn, lần quên, đánh giá gần nhất và thời điểm đến hạn. Không gọi một lần nhớ đúng là đã ghi nhớ dài hạn.

Lật thẻ dùng tự đánh giá; gõ từ chấm bằng Hangul sau khi chuẩn hóa khoảng trắng, dấu câu và Unicode, không tự công nhận từ đồng nghĩa. Chọn nghĩa và ghép cặp là nhận diện, không thay thế hoàn toàn khả năng tự gõ/nhớ. Ghép sai rồi sửa đúng được ghi nhận là nhớ chậm.

## Luồng sử dụng

- Từ vựng → Quyển → Bài → hàng từ gọn → mở cách dùng → đánh dấu đã học. Từ đó được đưa vào hàng đợi đến hạn.
- Ngữ pháp → Quyển → Bài → cấu trúc → giải thích, ví dụ → ôn ngữ pháp riêng.
- Ôn tập → Đến lịch / Khó nhớ / Từ mới / Đã lưu → chọn kiểu luyện → tối đa 10 mục mỗi lượt (ghép cặp tối đa 5) → phản hồi và lịch tiếp theo.
- Khu ôn từ mặc định chỉ dùng các mục đã đối chiếu sách. Người dùng có thể chủ động bật nội dung còn chờ đối chiếu; trạng thái nguồn không thay đổi do ôn nhiều lần.

## Lưu trữ và giới hạn hiện tại

Chế độ khách: localStorage trên thiết bị. Có cấu hình Supabase: dùng migration `202611120003_review_schedule.sql`, RLS theo tài khoản, cache riêng và hàng đợi ghi lại khi có mạng. Chưa kiểm tra Auth/RLS trên một project Supabase thật nếu chưa có project được kết nối.

Giờ hẹn hiển thị theo Việt Nam; dấu thời gian lưu dạng UTC. Website hiển thị số từ đến hạn và thời điểm ôn tiếp theo; chưa tự gửi email, push notification hoặc tạo automation.

Nội dung từ vựng chưa được xác minh toàn bộ 90 bài: xem `textbook-research.md`. Tính năng lịch ôn không đồng nghĩa nội dung đã được kiểm chứng với sách.


Cập nhật TOPIK I: khu ôn mặc định nhận thêm bộ bổ sung 180 mục theo chủ đề Quyển 1. Đây là nội dung Hanul tuyển chọn, không phải đối chiếu trang sách; bộ lọc nguồn cho phép chỉ ôn từ đã đối chiếu hoặc riêng bộ TOPIK I. Xem `topik1-research.md`.
