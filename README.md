# Anh – Trung – Kids · Web tự học (bán gói)

Tách từ kho `Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu` ngày 21/11/2026: hai web 99 ngày Little Seed và Seedling, máy chủ và Sheet riêng.

| | Link |
|---|---|
| Trang giới thiệu | https://ces-training.github.io/anh-trung-kids-tu-hoc/ |
| Web Little Seed / Seedling | `…/little-seed/`, `…/seedling/` (link riêng từng bé: `?con=MÃ`) |
| Trang quản trị (tài khoản riêng từng người) | https://ces-training.github.io/anh-trung-kids-tu-hoc/quan-tri/ |
| Sheet dữ liệu | https://docs.google.com/spreadsheets/d/1Yw3iS1oraI2Rc0YzGU6nVP_Qd-6AFRjdbGda9hasgc0/edit |

- **Khoá học nối tiếp (chị chốt 24/11/2026):** Little Seed 99 ngày → Seedling 99 ngày, không nhảy cóc. Một **mã khoá học + PIN** dùng cho cả hai web; Seedling tự mở khi con học xong 99 ngày Little Seed (đội CES có thể mở sớm bằng cách ghi `x` vào cột `mo_sd` của dòng mã trong Sheet).
- Unit 1 Little Seed mở cho mọi người (học thử, đăng nhập bằng tên để lưu bài). Seedling không có học thử.
- Gói 3 tháng, 6 tháng, 1 năm; hạn tính từ lần đăng nhập đầu; hết hạn chỉ còn Unit 1 Little Seed. Chế độ cô (`?gv=1`) không mở khoá bài trả phí.
- Sau này thêm Canopy vào gói 1 năm: thêm `'cp'` vào `LO_TRINH` (apps-script/Code.gs), cột `mo_cp`, và web `canopy/` dùng `chung/mo-unit-dau.js`.
- Trang quản trị: Mã kích hoạt (cấp, gia hạn, lọc theo hạn), Tổng quan, Học sinh, Máy & PIN, Điểm danh & buổi học, Sao & quà, Tài nguyên, Đội quản trị.
- Góc vinh danh video của lớp offline đã tắt ở bản này (video các con lớp offline không hiện cho khách mua gói).
- Cách bật máy chủ: `apps-script/HUONG-DAN.md`. Luật sửa kho: `CLAUDE.md`.

## Lấy bài mới từ web lớp offline
```
git clone --depth 1 https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu /tmp/nguon
git switch -c cap-nhat-bai-<ngày>
python3 cong-cu/lay_bai_tu_web_offline.py /tmp/nguon --thu   # xem trước
python3 cong-cu/lay_bai_tu_web_offline.py /tmp/nguon         # chép thật, kiểm tra rồi đẩy lên main (luật: CLAUDE.md)
```
Công cụ giữ nguyên phần riêng của web tự học (đăng nhập khoá học `chung/mo-unit-dau.js`, dòng SDL_API, tắt Góc vinh danh, chữ "chặng 1/2"). Bản vá không khớp thì dừng, không ghi gì.
