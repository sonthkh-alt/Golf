# ⛳ Golf Academy — ứng dụng dạy tập golf (VI · EN)

Học viện golf trong túi bạn: chương trình tập từng tuần, thư viện động tác có hình động, thể lực golf,
phân tích video swing ngay trên thiết bị, theo dõi tiến bộ (mph, vòng golf, kết quả bài tập),
tài khoản đám mây và gói Pro. Giao diện tiếng Việt (mặc định) và tiếng Anh.

Trang: https://sonthkh-alt.github.io/Golf/ · thêm `?lang=en` để mở bằng tiếng Anh.

## Tính năng
- **Trang chủ**: buổi tập tiếp theo của chương trình đang theo, thống kê, chuỗi ngày tập, mẹo hằng ngày.
- **Chương trình**: Nền tảng golf (miễn phí) · Linh hoạt & phòng chấn thương (miễn phí) · Short game · Putting Lab · Phá 90 · Driver 300 Yard (12 tháng, cá nhân hóa theo hồ sơ). Mỗi buổi chạy ở chế độ tập trung, có ô ghi kết quả (vd 8/10 putt) để đo tiến bộ.
- **Thể lực**: 4 buổi A–D theo giai đoạn, hình động từ chuyển động thật (MediaPipe), tự thay bài theo chấn thương/dụng cụ.
- **Kỹ thuật swing**: thư viện 19 động tác có lọc theo nhóm (setup, swing toàn phần, short game, putting); chip/pitch/bunker cắt từ cú swing thật, putting theo con lắc vai.
- **Phân tích video**: 33 điểm khớp, tách pha address → đỉnh → impact → finish, đo tư thế & tempo, đề xuất bài sửa; xử lý 100% trên máy.
- **Tiến bộ**: nhật ký mph, ghi vòng golf (điểm, putt, fairway, GIR, gậy phạt), handicap ước tính, lịch sử kết quả bài tập.
- **Tài khoản**: tự tạo tài khoản khách khi mở app (dữ liệu lưu đám mây ngay); thêm email để dùng đa thiết bị.
- **Gói Pro**: dùng thử 14 ngày, khóa nội dung nâng cao, thanh toán Lemon Squeezy hoặc chuyển khoản VietQR.

## Cấu trúc mã
| Tệp | Vai trò |
|---|---|
| `index.html` | Khung trang, các màn hình (`data-view`), văn bản tĩnh (tiếng Anh trong `data-en`) |
| `css/app.css` | Giao diện |
| `js/i18n.js` | Ngôn ngữ: `L()`, `T()`, `numL()`, `LOCALE`, `data-en` |
| `js/config.js` | Cấu hình sản phẩm: giá, dùng thử, link thanh toán, ngân hàng, Supabase |
| `js/cloud.js` | Tài khoản Supabase Auth + đồng bộ dữ liệu theo khóa + quyền Pro |
| `js/pro.js` | Trạng thái Pro, dùng thử, giới hạn miễn phí, hộp nâng cấp, khóa nội dung |
| `js/programs.js` | Dữ liệu chương trình song ngữ + tiến độ |
| `js/app.js` | Lõi: hồ sơ & cá nhân hóa, bài tập, hình người 3D, mocap, chế độ tập trung, phân tích video |
| `js/academy.js` | Router màn hình, Trang chủ, Chương trình, Tiến bộ, Gói Pro |
| `motion.js` | Chuyển động thật đóng gói sẵn (từ video giấy phép mở) |
| `supabase.sql` | Bảng & hàm máy chủ (chạy trong SQL Editor) |
| `supabase/functions/payment-webhook` | Webhook thanh toán → cấp Pro |

Không cần build: mở `index.html` hoặc đẩy lên GitHub Pages. Khi mở từ tệp cục bộ / localhost, app không ghi vào đám mây.

## Quản trị
Xem [ADMIN.md](ADMIN.md): bật tài khoản trên Supabase, cấu hình thanh toán, cấp Pro thủ công.
