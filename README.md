# 🏌️ Giáo án 300 Yard — Golf Speed Training

Web app giáo án tập luyện golf 12 tháng (thể lực + swing) cá nhân hóa.

- **Xem trực tiếp (GitHub Pages):** bật Pages trong Settings → Pages → Branch: main → / (root)
- File chính: `index.html`

Tính năng: lộ trình 12 tháng chu kỳ hóa, chi tiết từng buổi theo phút, giáo án swing theo giai đoạn, nhật ký mph có biểu đồ, đồng hồ nghỉ, panel "Hôm nay tập gì".

**Hồ sơ người tập (mới):** người mới nhập tên, tuổi, chiều cao, cân nặng, tay thuận, kinh nghiệm golf/tập tạ, số buổi/tuần, dụng cụ, chấn thương và thông số driver (loft, flex, trọng lượng shaft, chiều dài, grip) cùng số liệu đánh bóng. Giáo án tự tính lại: mức tạ theo thể trạng, bài thay thế an toàn, lịch 3/4/5 buổi, mốc mph & cự ly 12 tháng, bảng launch monitor, phân tích fitting driver và ưu tiên kỹ thuật. Hỗ trợ nhiều hồ sơ trên một máy, nhật ký mph tách riêng từng người.

**Giao diện:** menu dọc bên trái (thẻ hồ sơ, nhóm Tập luyện / Kế hoạch / Theo dõi, nút vào buổi hôm nay); trên điện thoại menu trượt ra từ nút ☰. Khi có hồ sơ, mọi phần giáo án mang nhãn "Giáo án riêng" và bài đã thay/chỉnh được đánh dấu ngay tại chỗ.

**Phân tích chi tiết:** hồ sơ tính yard đang mất theo từng nguồn (smash, attack angle, spin, launch), cột mốc tháng 1/3/6/9/12, mức tạ khởi điểm → mục tiêu, năng lượng/protein/carb/nước, rủi ro & bài phòng chấn thương (tự chèn vào khởi động).

**Phân tích video swing:** tải video điện thoại (chính diện hoặc dọc đường bóng); MediaPipe Pose chạy ngay trên trình duyệt (video không tải lên), tự tách address → đỉnh → impact → kết thúc, đo tempo, đầu, hông, cột sống, early extension, đường swing; khuyến nghị bài sửa và đưa thẳng vào Giáo án Swing.

**Chuyển động thật (mocap):** từ video đã phân tích, 33 khớp 3D của MediaPipe được retarget lên hình người (giữ vóc dáng chuẩn, lấy chuyển động thật), xoay được góc nhìn, lưu làm mẫu cho bất kỳ bài swing/bài tập nào — hình động trong Giáo án và chế độ tập trung phát chuyển động của chính người tập. Gậy chỉ là ước lượng (video không nhận diện gậy).

**Chuyển động thật đóng gói sẵn (`motion.js`):** 8 nguồn video có giấy phép mở (Wikimedia Commons: CC0 / CC BY / CC BY-SA / Public domain) được bắt bằng MediaPipe và retarget lên hình người, cắt đúng một rep, lặp mượt; dùng làm hình động mặc định cho Goblet Squat, KB Swing, RDL, Push-up, DB Row, 3 bài swing Buổi D, 4 bài thư viện Swing và 3 bài khởi động. Bài chưa có nguồn phù hợp (Bulgarian, Box Jump, Bridge, med ball, Pallof, Dead Bug, Side Plank, Lateral Lunge, Step Drill) vẫn dùng hình kịch bản. Clip người dùng tự quay ưu tiên hơn clip đóng gói.


## Lưu trữ đám mây tự động (Supabase)

Hồ sơ, nhật ký mph, buổi đã tập và clip chuyển động **tự lưu lên Supabase** (project `pzojrhwtoxwcsrkucwti`) ~1,5 giây sau mỗi thay đổi. Mở trang trên bất kỳ thiết bị nào cũng tự tải về — không mã, không đăng nhập, không thao tác.

- Mọi thiết bị dùng chung một kho (`SPACE` trong `sync.js`); hồ sơ đang chọn là riêng từng máy. Máy mới chưa chọn ai thì tự chọn hồ sơ đầu tiên.
- Máy mới mở trang: chờ lần đồng bộ đầu (tối đa 4 giây) rồi mới hỏi tạo hồ sơ, nên không bị hỏi khi đám mây đã có dữ liệu.
- Gộp dữ liệu: bản mới hơn thắng theo từng khóa; hồ sơ gộp theo từng người; hồ sơ đã xóa không bị khôi phục; ghi có kiểm tra phiên bản, xung đột thì tự thử lại.
- Chạy từ tệp cục bộ hoặc localhost thì **không** đồng bộ (tránh ghi dữ liệu thử vào kho thật); bài thử dùng `window.GOLF_SYNC_CFG` trỏ sang máy chủ giả lập.
- Máy chủ: chạy `supabase.sql` một lần trong SQL Editor (bảng `golf_sync` khóa kín + hàm `golf_pull` / `golf_push`).
- **Lưu ý riêng tư:** kho dùng chung cho mọi người mở trang, không có đăng nhập — ai có link đều xem/sửa được dữ liệu.
