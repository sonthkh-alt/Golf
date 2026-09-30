# Golf Academy — hướng dẫn quản trị

Tài liệu cho chủ ứng dụng: bật tài khoản người dùng, bán gói Pro, cấp Pro thủ công và các công tắc cấu hình.
Mọi cấu hình nằm trong [js/config.js](js/config.js).

## 1. Cơ sở dữ liệu & tài khoản (bắt buộc, làm một lần)

Project Supabase: `pzojrhwtoxwcsrkucwti`.

1. **Chạy SQL mới** — Dashboard → SQL Editor → New query → dán toàn bộ [supabase.sql](supabase.sql) → **Run**.
   Tạo bảng `golf_user_data` (dữ liệu riêng từng người), `golf_entitlements` (quyền Pro) và các hàm.
   Đồng thời gỡ hai hàm của kho dùng chung cũ, nên không ai đọc được dữ liệu cũ nữa.
2. **Bật đăng nhập ẩn danh** — Authentication → Sign In / Providers → **Allow anonymous sign-ins** → Save.
   Nhờ vậy người mới mở app là có tài khoản khách và dữ liệu tự lưu lên đám mây, không cần thao tác.
   Nếu không bật: app vẫn chạy và mời người dùng đăng nhập bằng email (không mật khẩu) để lưu đám mây.
3. **Địa chỉ trang** — Authentication → URL Configuration:
   - Site URL: `https://sonthkh-alt.github.io/Golf/`
   - Redirect URLs: thêm `https://sonthkh-alt.github.io/Golf/**`
   Bước này BẮT BUỘC cho đăng nhập bằng link: link trong email chỉ quay về app nếu địa chỉ app nằm trong danh sách này
   (mặc định Supabase trỏ về `http://localhost:3000`, bấm link sẽ ra trang lỗi).
4. **Mẫu email có mã 6 số (tùy chọn)** — người dùng chỉ cần bấm nút xác nhận trong email; mã số chỉ là cách dự phòng — Authentication → Emails → Templates.
   Trong mẫu **Magic Link** và **Change Email Address**, thêm dòng:
   `<p>Mã đăng nhập / Your code: <b>{{ .Token }}</b></p>`
   Người dùng nhập mã ngay trong app; link trong email vẫn dùng được.
5. **Máy chủ email riêng (SMTP) — cần trước khi có người dùng thật.**
   Máy chủ email dựng sẵn của Supabase chỉ gửi ~2 email/giờ và CHỈ gửi tới email thành viên project, nên người dùng khác
   sẽ không nhận được link. Cách nhanh nhất với Gmail (~500 email/ngày, miễn phí):
   - Bật xác minh 2 bước cho Gmail → https://myaccount.google.com/apppasswords → tạo *App password* (16 ký tự).
   - Supabase → Authentication → Emails → **SMTP Settings** → Enable custom SMTP:
     Host `smtp.gmail.com` · Port `587` · Username = địa chỉ Gmail · Password = App password ·
     Sender email = địa chỉ Gmail · Sender name `Golf Academy`.
   - Authentication → **Rate Limits** → "Rate limit for sending emails" → tăng lên 30–100/giờ (chỉ sửa được sau khi bật SMTP riêng).
   Khi lượng người dùng lớn, chuyển sang Resend / SendGrid / Amazon SES với tên miền riêng.
6. **Đăng nhập bằng mật khẩu (không cần email)** — app có sẵn mục "🔑 Dùng mật khẩu". Để tạo tài khoản bằng mật khẩu
   không phải chờ email, vào Authentication → Sign In / Providers → **Email** → tắt **Confirm email** → Save.
   Đánh đổi: email không được xác minh (ai cũng có thể đăng ký bằng email bất kỳ). Khi đã có SMTP riêng, có thể bật lại.

Người dùng: vào **Hồ sơ → Tài khoản** nhập email → bấm nút xác nhận trong email → đã đăng nhập
(tab đang mở app cũng tự cập nhật). Trên máy khác: nhập cùng email → bấm link trong email trên máy đó → dữ liệu tự tải về.

## 2. Gói Pro

Công tắc trong `APP_CFG`:

| Khóa | Ý nghĩa |
|---|---|
| `paywall` | `false` = mở mọi nội dung (chế độ thử nghiệm). `true` = khóa nội dung Pro. |
| `trialDays` | Số ngày dùng thử Pro cho người mới (mặc định 14). |
| `freeVideoPerMonth` | Số lần phân tích video miễn phí mỗi tháng (mặc định 3). |
| `price` | Giá hiển thị cho tiếng Việt và tiếng Anh. |
| `checkout.monthly` / `checkout.yearly` | Link thanh toán quốc tế. Để trống thì ẩn nút. |
| `bank` | Chuyển khoản trong nước qua VietQR. Để trống `bin`/`account` thì ẩn. |
| `support` | Email hỗ trợ hiển thị ở trang Pro. |

Nội dung Pro: chương trình Short game, Putting Lab, Phá 90, Driver 300 Yard (lộ trình, giai đoạn 2–4), báo cáo chi tiết & fitting driver, phân tích video không giới hạn, lưu chuyển động làm mẫu.
Miễn phí: Nền tảng golf, Linh hoạt & phòng chấn thương, thư viện động tác, nhật ký, vòng golf, lưu đám mây, 3 lần phân tích video mỗi tháng.

### 2a. Cấp Pro thủ công (chuyển khoản, tặng, đối tác)
Trong SQL Editor:

```sql
-- theo email tài khoản, cộng dồn 30 ngày
select public.golf_grant_pro('khach@email.com', 30, 'CK Vietcombank 01/10');
-- theo mã khách hàng 8 ký tự (hiện ở cuối trang Gói Pro và trong nội dung chuyển khoản "GA XXXXXXXX")
select public.golf_grant_pro_code('1A2B3C4D', 365, 'CK gói năm');
-- xem ai đang có Pro
select u.email, e.* from golf_entitlements e join auth.users u on u.id = e.user_id order by e.updated_at desc;
```
Tự cấp Pro cho chính bạn: `select public.golf_grant_pro('email-cua-ban@…', 3650, 'owner');`

### 2b. Chuyển khoản VietQR
Điền `bank` trong config.js, ví dụ Vietcombank: `bin:'970436'`, `account:'0123456789'`, `name:'NGUYEN VAN A'`.
Trang Pro sẽ hiện mã QR có sẵn số tiền và nội dung `GA <mã khách hàng>`. Khi nhận tiền, chạy `golf_grant_pro_code`.

### 2c. Thanh toán thẻ quốc tế tự động (Lemon Squeezy)
Lemon Squeezy là "merchant of record": họ thu tiền, xử lý thuế VAT/GST toàn cầu và trả tiền cho bạn.
1. Tạo store và 2 sản phẩm dạng subscription (tháng, năm) — tên gói năm nên chứa chữ "Year".
2. Dán link checkout của từng gói vào `checkout.monthly` / `checkout.yearly`.
   App tự nối `checkout[custom][user_id]` và email để webhook biết ai đã trả tiền.
3. Triển khai webhook (cần Supabase CLI):
   ```bash
   supabase functions deploy payment-webhook --no-verify-jwt --project-ref pzojrhwtoxwcsrkucwti
   supabase secrets set LEMON_SIGNING_SECRET=<signing secret> --project-ref pzojrhwtoxwcsrkucwti
   ```
4. Lemon Squeezy → Settings → Webhooks: URL `https://pzojrhwtoxwcsrkucwti.supabase.co/functions/v1/payment-webhook`,
   dùng cùng signing secret, chọn các sự kiện `order_created`, `subscription_*`.
Mã webhook: [supabase/functions/payment-webhook/index.ts](supabase/functions/payment-webhook/index.ts). Muốn dùng Stripe hay Paddle thì thay phần đọc sự kiện, bảng `golf_entitlements` giữ nguyên.

## 3. Nội dung

- Chương trình tập: [js/programs.js](js/programs.js) — mỗi chương trình gồm các giai đoạn, mỗi giai đoạn có danh sách buổi; mọi chuỗi viết song ngữ `_('tiếng Việt','English')`.
- Thư viện động tác, bài thể lực, phân tích: [js/app.js](js/app.js) — chuỗi hiển thị dùng `L('tiếng Việt','English')`.
- Văn bản tĩnh trong [index.html](index.html): tiếng Việt là nội dung, tiếng Anh nằm trong thuộc tính `data-en`.
- Đổi ngôn ngữ: nút ở menu và chân trang, hoặc thêm `?lang=en` vào đường link.

## 4. Kiểm tra nhanh sau khi cấu hình
1. Mở trang ở cửa sổ ẩn danh → vào Hồ sơ → dòng trạng thái phải là "☁ ✓ Đã lưu lúc …".
2. Nhập email → nhận mã → xác nhận → dòng trạng thái hiện email.
3. Mở trên điện thoại, nhập cùng email → dữ liệu hiện ra.
4. `select public.golf_grant_pro('<email đó>', 1, 'test');` → tải lại app → trang Gói Pro báo "Bạn đang dùng Pro đến …".
