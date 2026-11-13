# Hanul — Website học ngữ pháp tiếng Hàn

## Quy chuẩn giao diện

Trước khi tạo hoặc sửa lớn một màn hình/tính năng, đọc [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Quy chuẩn này định nghĩa màu semantic, typography, spacing, component, responsive, accessibility và checklist hoàn thành. Các coding agent phải tuân theo [AGENTS.md](AGENTS.md).

## Khu học và ôn tập

Website có lối vào riêng **Từ vựng**, **Ngữ pháp** và **Ôn tập**. Khu ôn từ hỗ trợ lật thẻ, gõ Hangul, chọn nghĩa, ghép cặp; lọc theo bài/quyển, từ đã lưu, từ khó nhớ và từ đến hạn. Mặc định dùng từ đã đối chiếu sách và bộ TOPIK I bổ sung, có thể lọc riêng từng nguồn.

Lịch ôn là heuristic minh bạch: Không nhớ → 10 phút; Nhớ chậm → 1 ngày; Nhớ rõ → lần lượt 1/3/7/14/30/60/120 ngày giữa các lượt thành công. Đây không phải lịch tối ưu phổ quát hoặc FSRS. Xem [nghiên cứu UI/UX và ghi nhớ](content/learning-ux-research.md).

Chạy thêm [migration lịch ôn](supabase/migrations/202611120003_review_schedule.sql) sau hai migration trước để đồng bộ lịch qua Supabase. Nếu chưa cấu hình Supabase, lịch vẫn lưu trên trình duyệt. Chỉ hiển thị nhắc ôn trong web, không tự gửi email hay thông báo hệ thống.

## TOPIK I theo chủ đề Quyển 1

Bộ khởi đầu có 180 mục theo bài, 12 mục cho mỗi chủ đề trong 15 bài Quyển 1 (có từ được luyện lại ở nhiều bài). Đã thêm 134 mục và bổ sung 46 mục có sẵn, giữ nguyên ID tiến độ. Nghĩa, ví dụ và lưu ý được biên soạn riêng. Nhãn TOPIK I bổ sung không xác nhận từ có trong sách hoặc sẽ xuất hiện trong đề thi; đây chưa phải toàn bộ từ vựng TOPIK I. Tổng dữ liệu hiện tại là 546 mục. Xem [nghiên cứu và phân bổ chủ đề](content/topik1-research.md); chỉnh dữ liệu ở `content/topik1-book1.tsv`, sau đó chạy build.

## Cập nhật đối chiếu giáo trình

Đã tìm nguồn KF chính thức cho sáu quyển và đối chiếu mục lục 90 bài với Excel. Bài 1 quyển 1 hiện có 56 mục đã đọc trực tiếp từ bản scan 378 trang: 32 mục từ cơ bản (trang in 32–33) và 24 từ mới cuối bài (trang in 50). 89 bài khác **chưa hoàn tất đối chiếu từng từ**; danh sách biên soạn trước đó có nhãn chờ đối chiếu trên website.

Chi tiết nguồn, phiên bản, phạm vi và cách kiểm tra: [báo cáo nghiên cứu](content/textbook-research.md). Các số lượng và mô tả 360 mục ở phần lịch sử bên dưới là bộ biên soạn trước khi đối chiếu, không phải số lượng từ chính thức của giáo trình.

Từ vựng hiển thị dạng gọn (từ Hàn + nghĩa Việt); bấm một hàng để mở gợi ý, ví dụ nếu có, nguồn/trang sách, nút nghe và trạng thái học. `content/textbook-lesson-1-1.json` là bản nhập đã đối chiếu; `content/vocabulary.tsv` vẫn là bộ biên soạn cũ được giữ riêng. Build ghép dữ liệu và giữ ID cũ để không làm lệch tiến độ.

Vite + JavaScript, deploy như static site. Có sẵn 302 cấu trúc, 90 bài, 6 quyển và ghi chú từ Excel. Không cần server Node chạy thường trực. Supabase tùy chọn để đăng nhập bằng email và đồng bộ yêu thích/tiến độ.

## Chạy trên máy

Cài Node.js 22.12+ (hoặc Node 24) và npm.

```sh
npm --prefix handoo install
npm start
```

Hai lệnh trên chạy từ thư mục gốc `9-KoreaLanguageWeb`; `npm start` chuyển tiếp tới ứng dụng trong `handoo`.

Mở URL Vite in trong terminal. Chưa cấu hình Supabase vẫn học bình thường ở chế độ khách.

```sh
npm test       # dữ liệu, UI logic, persistence và sync
npm run build  # tạo dist/
npm run preview # kiểm tra bản production
```

## Deploy Vercel

1. Đưa **thư mục handoo** lên repository GitHub của bạn.
2. Vercel → Add New Project → Import repository.
3. Nếu repository chứa thư mục `handoo`, chọn **Root Directory = handoo**. Nếu đưa riêng nội dung `handoo` lên repo, để root mặc định.
4. Framework **Vite**, Install `npm install`, Build `npm run build`, Output **dist**, Node **22 hoặc 24**. Có sẵn `vercel.json`.
5. Thêm biến môi trường Supabase bên dưới nếu muốn dùng tài khoản. Bấm Deploy.

Không cần `.openai/hosting.json` để deploy Vercel/Netlify; đó chỉ là metadata của bản Sites. Quyền riêng tư của bản Sites không tự áp dụng cho bản deploy ở hosting khác.

## Deploy Netlify / static hosting

Import repository, chọn Base directory theo vị trí `handoo`. `netlify.toml` có sẵn build `npm run build` và publish `dist`. Thêm biến môi trường rồi deploy. Không có URL động nên không cần SPA rewrite.

Hoặc build trên máy và upload toàn bộ nội dung `dist/` lên static hosting. Không upload Excel, `.env`, `node_modules` hay thư mục mã nguồn vào public.

## Bật Supabase

1. Tạo project tại Supabase và chọn region gần người dùng. Chờ trạng thái project là **Healthy**.
2. Trong project, mở **SQL Editor → New query**. Chạy lần lượt ba file dưới đây: mở file trong repo, copy toàn bộ SQL, dán vào editor rồi bấm **Run**. Mỗi file chạy một lần:

   - [Tạo bảng tiến độ ngữ pháp](supabase/migrations/202611120001_learning_progress.sql)
   - [Cho phép ID từ vựng trong bảng tiến độ](supabase/migrations/202611120002_vocabulary_progress.sql)
   - [Tạo bảng lịch ôn từ](supabase/migrations/202611120003_review_schedule.sql)

   Nếu đã chạy file đầu trước đó, chạy file thứ hai và thứ ba; không chạy lại migration đầu. Các policy trong SQL bật RLS để từng tài khoản chỉ đọc/ghi tiến độ của chính mình.

3. Bật đăng nhập bằng email/mật khẩu: vào **Authentication → Sign In / Providers → Email**. Bật provider Email và cho phép **Email + Password**. Nếu muốn người dùng xác nhận email, bật **Confirm email**. Khi bật xác nhận, user cần bấm liên kết Supabase gửi đến email trước lần đăng nhập đầu tiên.

4. Cấu hình URL: vào **Authentication → URL Configuration**. Đặt **Site URL** thành domain chính thức sau khi deploy, ví dụ `https://ten-mien-cua-ban.com`. Trong **Redirect URLs**, thêm URL dev `http://127.0.0.1:5173/**`, domain chính thức `https://ten-mien-cua-ban.com/**`, và domain preview nếu bạn cần thử đăng nhập trên preview. URL phải khớp domain bạn mở trong trình duyệt.

5. Tạo file `handoo/.env.local` từ `.env.example`; lấy **Project URL** và **Publishable key** trong cửa sổ **Connect** của project hoặc **Project Settings → API Keys** rồi điền vào file:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

   Lưu file, dừng rồi chạy lại dev server bằng `npm start` từ thư mục gốc. Bấm **Tài khoản** để thử. Nếu hai biến còn trống, ứng dụng vẫn chạy ở chế độ khách.

6. (Tùy chọn) Bật Google: trong **Authentication → Sign In / Providers → Google**, nhập OAuth Client ID và Client Secret do Google Cloud cấp. Trong Google Cloud Console, tạo OAuth Client loại **Web application** và thêm callback URL Supabase hiển thị ở trang provider, thường có dạng `https://<project-ref>.supabase.co/auth/v1/callback`, vào **Authorized redirect URIs**. Thêm domain website vào **Authorized JavaScript origins**. Sau đó bật Google trong Supabase và thử nút Google trên website.

7. (Tùy chọn) Bật Apple: cần Apple Developer account, App ID/Services ID và Sign in with Apple key. Nhập thông tin provider theo hướng dẫn trong **Authentication → Sign In / Providers → Apple**; thêm callback URL Supabase vào cấu hình Return URLs của Apple. Apple có thêm bước tạo client secret có hạn sử dụng, nên chỉ làm bước này khi bạn có tài khoản Apple Developer.

8. Trước khi deploy, vào Vercel/Netlify → **Environment Variables**, thêm cùng hai biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` cho môi trường cần dùng. Deploy lại sau khi lưu vì Vite nhúng hai biến vào bundle khi build.

9. Kiểm tra: đăng ký một email thử → xác nhận email nếu đang bật Confirm email → đăng nhập → đăng xuất → đăng nhập lại → bấm **Quên mật khẩu?**. Sau đó thử đăng nhập Google/Apple nếu đã bật provider. Cuối cùng kiểm tra đồng bộ theo mục “Kiểm tra sau cấu hình Supabase” bên dưới.

10. Trước khi mở đăng ký công khai, thay dòng đồng ý trong form thành liên kết thực đến Điều khoản sử dụng và Chính sách bảo mật của website. Hiện form chỉ có checkbox giao diện; nội dung pháp lý và URL chính sách chưa có trong repo.

Frontend chỉ dùng **publishable key**; không dùng service_role, secret key hoặc mật khẩu database trong `VITE_*`. Migration bật RLS: mỗi user chỉ đọc/ghi dòng của chính mình; người chưa đăng nhập không được đọc bảng tiến độ.

Để gửi email cho người dùng thực tế, cấu hình SMTP và giới hạn gửi Supabase theo tài khoản của bạn. Dịch vụ email mặc định có giới hạn.

### Quy tắc tiến độ

- Khách lưu trong localStorage. Tiến độ website cũ trên **cùng origin** được chuyển sang định dạng mới.
- Mỗi tài khoản có cache riêng. Không tự nhập tiến độ khách vào tài khoản, tránh trộn dữ liệu trên máy dùng chung.
- Thay đổi khi mất mạng được giữ trên thiết bị và gửi lại sau, bao gồm bỏ lưu/bỏ đánh dấu.
- Hai thiết bị sửa cùng cấu trúc: bản ghi server nhận sau cùng được giữ. Không ghi đè các cấu trúc khác hàng loạt.
- Không dùng Realtime: máy khác tải dữ liệu khi focus hoặc bấm Đồng bộ ngay.
- Xóa dữ liệu trình duyệt sẽ mất tiến độ khách và thay đổi chưa đồng bộ. Chuyển domain không tự chuyển localStorage.

### Kiểm tra sau cấu hình Supabase

1. Đăng nhập A, lưu một ngữ pháp và đánh dấu đã học.
2. Đăng nhập A trên trình duyệt khác, xác nhận trạng thái.
3. Bỏ đánh dấu ở máy thứ hai; quay về máy đầu, bấm Đồng bộ ngay.
4. Đăng nhập B, xác nhận không thấy tiến độ A. Với JWT của B, truy vấn dòng A phải trả rỗng; ghi dòng A phải bị từ chối.
5. Ngắt mạng, thay đổi tiến độ, bật mạng và kiểm tra đồng bộ lại.

Unit tests dùng adapter giả lập. Cần các bước trên với project thật để xác nhận Auth, email và RLS trong môi trường triển khai.

## Cấu trúc

```text
index.html             Giao diện
src/app.js             Tìm kiếm, lọc, chi tiết, flashcards
src/styles.css         Responsive UI
src/data.js            Dữ liệu được trích xuất, đi kèm bản build
src/progress.js        Cache tài khoản và hàng đợi đồng bộ
src/account.js         Supabase Auth và truy vấn database
src/main.js            Khởi tạo
scripts/extract.py     Nhập XLSX, không sửa file gốc
supabase/migrations/   SQL schema, trigger, RLS
tests/                 Kiểm tra persistence/sync
vercel.json            Cấu hình Vercel
netlify.toml           Cấu hình Netlify
.github/workflows/     CI: install, test, build
```

Ngữ pháp và từ vựng đi kèm frontend; Supabase chỉ lưu tiến độ. Nội dung hiện có 302 cấu trúc ngữ pháp và 360 mục từ vựng, không cần truy vấn database mỗi lần mở bài.

## Luồng học và nội dung từ vựng

Trang chủ → chọn quyển → chọn bài → Từ vựng / Ngữ pháp → Ôn bài này. Tra cứu và Đã lưu hỗ trợ cả từ vựng lẫn ngữ pháp. Mỗi bài có tiêu đề tiếng Việt và tiếng Hàn, nhóm chủ đề theo cột D của Excel, câu ví dụ Hàn–Việt và trạng thái học.

`content/vocabulary.tsv` là nguồn biên tập từ vựng. Hiện có 4 từ/cụm từ mỗi bài, bao phủ 90 bài và cả 263 nhóm chủ đề trong file. Đây là nội dung bổ sung tuyển chọn theo chủ đề, **không phải danh sách từ vựng chính thức hay đầy đủ của sách**. Nghĩa và ví dụ được biên soạn riêng. Nguồn tham khảo và phạm vi nội dung được hiển thị ngay trong website.

```sh
npm run data:vocabulary  # kiểm tra dữ liệu và tạo src/vocabulary.js
npm test
npm run build
```

Header `@1.1|Tên bài tiếng Việt|Nhóm 1;Nhóm 2;Nhóm 3` theo đúng thứ tự nhóm trong Excel. Mỗi dòng từ vựng: `Từ Hàn|Nghĩa Việt|Loại từ|Chỉ số nhóm từ 0|Câu ví dụ Hàn|Dịch Việt`.

Giữ nguyên thứ tự các dòng cũ khi thêm từ mới: ID từ vựng `V1-1-1` được sinh theo thứ tự trong bài và liên kết với tiến độ. Thêm dòng mới vào cuối bài. Số lượng từ trong giao diện được tính tự động. Chạy kiểm tra dữ liệu sau khi bổ sung. Có thể sửa nghĩa/ví dụ mà không thay đổi ID.

## Cập nhật Excel

Đặt một `.xlsx` ở thư mục cha của `handoo`, đúng cấu trúc: A quyển, B bài, C chủ đề, D từ vựng, E ngữ pháp + ghi chú. Cần Python 3, không cần thư viện ngoài.

```sh
npm run data:import
npm test
npm run build
```

Importer giữ vị trí ô (`E9`, …) làm ID. **Không chèn/xóa/sắp xếp lại hàng khi đã có người dùng thật** vì hàng liên kết với tiến độ; thay đổi cấu trúc cần ánh xạ ID và migration dữ liệu trước. Sửa nội dung trong hàng hiện tại được hỗ trợ.

File dữ liệu được commit nên hosting không cần Python hay XLSX. Giọng đọc cấu trúc dùng Web Speech API, phụ thuộc giọng Hàn trên thiết bị.

## Tài liệu

- [Vite deployment](https://vite.dev/guide/static-deploy)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
- [Supabase email/password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase OAuth sign-in](https://supabase.com/docs/guides/auth/social-login)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
