# Thiết kế màn hình từ vựng trong bài

Danh sách từ là mặc định. Các thẻ hiển thị tiếng Hàn, nghĩa Việt, nút nghe và nút đánh dấu đã học. Ví dụ và nguồn nằm trong phần mở rộng. Thanh chế độ dùng nút có trạng thái được chọn, hỗ trợ bàn phím và tự xuống hàng trên điện thoại.

Các lượt luyện giới hạn 10 từ, nối từ dùng 5 cặp. Flashcard yêu cầu tự nhớ trước khi xem nghĩa; viết, nghe viết và trắc nghiệm trả phản hồi kèm đáp án sau mỗi câu. Kết quả lượt luyện là phản hồi trong phiên; nút đánh dấu đã học lưu vào tiến độ hiện có. Các lượt này chưa cập nhật lịch ôn SRS.

## Nguồn nghiên cứu

- Carnegie Mellon University, Retrieval Practice: https://www.cmu.edu/teaching/resources/instructionalstrategies/activelearningstrategies/retrievalpractice/ — tự truy xuất kiến thức và phản hồi sau câu trả lời hỗ trợ việc học. Đây là cơ sở cho luồng trả lời trước, xem đáp án sau; không coi số chế độ là bằng chứng về hiệu quả.
- W3C, WCAG 1.4.3: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html — chữ thông thường cần tương phản tối thiểu 4.5:1. Giao diện dùng chữ #182b40, #384b60, #526174 trên nền trắng; nút chính #176b63 với chữ trắng. Chưa thực hiện kiểm toán WCAG toàn ứng dụng.
- MDN, SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition — hỗ trợ tùy trình duyệt, có thể cần dịch vụ trực tuyến. Giao diện thông báo trước khi bật micro và có trạng thái không hỗ trợ, từ chối quyền, lỗi nhận dạng. Chỉ so khớp văn bản nhận dạng với từ mẫu, không chấm âm vị hoặc cho điểm phát âm chuyên môn.

## Giới hạn kiểm tra

Build production và kiểm tra cú pháp được chạy sau thay đổi. Giọng đọc phụ thuộc giọng Hàn có sẵn trên thiết bị. Nhận dạng micro cần xác nhận trên thiết bị và trình duyệt của người dùng; không thể xác minh chất lượng nhận dạng bằng kiểm thử tĩnh.
