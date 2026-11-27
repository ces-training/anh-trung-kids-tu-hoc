# Máy chủ Web tự học (bán gói) – cách bật (làm 1 lần, khoảng 10 phút)

Sheet dữ liệu: **Anh Trung Kids Tự học** – https://docs.google.com/spreadsheets/d/1Yw3iS1oraI2Rc0YzGU6nVP_Qd-6AFRjdbGda9hasgc0/edit
Máy chủ này **riêng** cho web tự học, không đụng Sheet và máy chủ của lớp offline 48 buổi.

## 1. Dán mã vào Sheet
1. Mở Sheet trên → **Tiện ích mở rộng → Apps Script**.
2. Xoá code mẫu trong `Code.gs`, dán toàn bộ tệp `apps-script/Code.gs` của kho này. Bấm **Lưu**.
3. Ở thanh chọn hàm, chọn **caiDat** → **Chạy** → cho phép quyền. Máy chủ tự tạo các tab (HocSinh, TienDo, QuanTriVien, NhatKyQT, CaiDatQT…).
4. Mở tab **CaiDatQT** của Sheet: dòng `ma_thiet_lap` là **mã thiết lập** để tạo tài khoản Quản lý đầu tiên.

## 2. Triển khai
1. **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web**. Thực thi với tư cách: **Tôi**. Ai có quyền truy cập: **Bất kỳ ai**.
2. Chép **URL ứng dụng web** (đuôi `/exec`). Mở link đó thêm `?action=ping`, thấy `"tu_hoc":1` là được.
3. Gửi link `/exec` cho Claude dán vào 3 chỗ (hoặc tự sửa):
   - `little-seed/ls-may-chu.js` và `seedling/seedling-may-chu.js`: dòng `const SDL_API = '';`
   - `quan-tri/app.js`: dòng `const API = '';`
   Khi còn trống: web chỉ mở **Unit 1 học thử**, trang quản trị báo "chưa nối máy chủ".

## 3. Tài khoản quản trị
1. Mở trang quản trị → trang hỏi **mã thiết lập** → nhập mã ở tab CaiDatQT, đặt tên đăng nhập, mật khẩu → thành tài khoản **Quản lý**.
2. Tab **Đội quản trị**: tạo tài khoản cho từng người (Quản lý hoặc Nhân viên). Người mới nhận mật khẩu tạm, phải đổi ở lần vào đầu.
3. Mọi việc cấp mã, gia hạn, sửa tài khoản ghi ở tab **NhatKyQT**.

## 4. Cấp mã, gia hạn
- Tab **Mã kích hoạt** (ở level Little Seed): copy từ Excel các cột **Tên con · SĐT ba mẹ · Năm sinh · Tên ba mẹ · Trình độ Anh · Trình độ Trung** (chữ tự do, cột nào chưa có để trống) rồi dán vào ô cấp mã; hoặc chỉ gõ tên và SĐT sau dấu phẩy. Sale cũng có thể nhập thẳng vào các cột `nam_sinh`, `phu_huynh`, `trinh_do_anh`, `trinh_do_trung` của tab HocSinh, trang quản trị đọc lại ngay. Cả Quản lý và Nhân viên đều xem được; web của con và bảng cô theo PIN không nhận các thông tin này. Chọn gói 3 tháng, 6 tháng hoặc 1 năm → **Cấp mã** → **Chép tin Zalo** gửi từng nhà. Một mã dùng cho cả khoá: học xong 99 ngày Little Seed thì Seedling tự mở. Muốn mở Seedling sớm cho một bé (đã học xong Little Seed ở lớp), ghi `x` vào cột `mo_sd` của dòng mã đó trong tab HocSinh.
- Hạn tính từ **lần đầu ba mẹ đăng nhập bằng mã + PIN**. Hết hạn: con chỉ học Unit 1, web hiện ngày hết hạn và hotline.
- **Gia hạn**: còn hạn thì nối tiếp; đã hết hạn thì tính lại từ hôm gia hạn; chưa kích hoạt thì cộng dồn tháng. Bài và sao của con giữ nguyên.
- Mã Little Seed không đăng nhập được web Seedling và ngược lại.

## Cập nhật máy chủ sau này
Sửa `Code.gs` → dán lại vào Apps Script của Sheet → **Triển khai → Quản lý các bản triển khai** → bút chì → **Phiên bản mới** → Triển khai. Link `/exec` giữ nguyên.
