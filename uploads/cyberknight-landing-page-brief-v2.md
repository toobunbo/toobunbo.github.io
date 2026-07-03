# CYBERKNIGHT — Landing Page Brief (v2, đã chốt)

> Bản thay thế cho brief landing page trước đó. Landing page giờ là **1 trang bìa tối giản**, không phải trang có nhiều section như đề xuất ban đầu. Đưa file này cho Claude Design để dựng lại phần Landing, dựa trên theme/font đã chốt ở frame "index" (đính kèm/tham chiếu riêng).

---

## 1. Bối cảnh — Theme & Typography đã chốt

Theme và font đã được duyệt qua bản thiết kế trang **Archive/Index** (frame `index` trong file Design System). Landing page phải **dùng nguyên** hệ thống này, không tạo bảng màu/font riêng.

**Tinh thần cốt lõi đã xác nhận đúng hướng:**
- Nền giấy kem là mặc định (KHÔNG phải nền tối) — đúng chất "trang manga in thật".
- Mực đen than cho chữ/viền chính.
- Đỏ chu sa (vermillion) là accent chính duy nhất — dùng cho badge 連載/SERIAL, tiêu đề nhấn, nút hành động (kiểu nút "READ CHAPTER" đã có). Không dùng cyan/neon.
- Wordmark lockup: **CYBER** (đen) + **KNIGHT** (đỏ chu sa), đặt cạnh nhau — đã chốt, dùng nguyên, **bỏ hẳn** chi tiết đường mạch điện tử từng đề xuất trước đó (không cần thiết vì wordmark đã đủ mạnh).
- Font display đậm/condensed cho tiêu đề, font đọc (serif nhẹ) cho thân bài, mono cho tag/code, hệ con dấu vuông/tròn viền đỏ cho nhãn độ khó (難/中/易) và thể loại (連載/番外編) — toàn bộ giữ nguyên như bản Index.
- Lấy chính xác token màu (hex) và font-family từ file Figma "Design System" hiện có — không suy đoán lại từ đầu.

---

## 2. Landing Page — Cấu trúc (đã chốt, tối giản)

**Toàn bộ landing chỉ là 1 màn hình cover, KHÔNG cuộn xuống thêm nội dung nào khác.**

Chỉ gồm đúng 4 thành phần:

### 2.1 Menu — góc trên bên phải
- Đầy đủ 5 mục, dùng nguyên style nav đã có ở bản Index: `ARCHIVE` · `CTF` · `BUG BOUNTY` · `RESEARCH` · `ABOUT`.
- Không rút gọn thành icon hamburger.

### 2.2 Wordmark — chính giữa
- CYBERKNIGHT, dùng nguyên lockup đã chốt (CYBER đen + KNIGHT đỏ).
- **Không** thêm chi tiết đường mạch điện tử nối 2 từ (đã loại khỏi scope).
- Là điểm neo thị giác duy nhất, to nhất trên trang.

### 2.3 Hai ô hành động — ngay dưới wordmark
- **About** và **Team Member** — chỉ 2 ô, mỗi ô dẫn vào 1 trang riêng.
- Style: viền mực đen dày, góc vuông tuyệt đối — đồng bộ ngôn ngữ panel đã dùng cho card chapter bên Index (không dùng gradient bo tròn kiểu tham khảo ban đầu đã bị loại).
- Icon: line-art đơn sắc, nét mảnh — không dùng icon set phẳng kiểu web thông thường.
- Có thể đánh số **01 / 02** trên mỗi ô, nhất quán với cách đánh số chapter (CH.06, CH.05...) bên Index.
- 2 ô xếp ngang hàng nhau, kích thước bằng nhau.

### 2.4 Nền — storyboard line-art nhạt
- Trên nền giấy kem, không phải nền đen.
- Vài nét phác thảo/line-art rất mờ (thấp opacity) rải trong các khung panel mảnh — đủ để gợi cảm giác "bản thảo đang vẽ", không để khung hoàn toàn trống trơn (tránh trông như thiếu ảnh — đây là lỗi đã gặp ở bản thử trước).
- Vai trò thuần túy là khí quyển nền, không cạnh tranh thị giác với wordmark và 2 ô hành động.

---

## 3. Đã loại khỏi scope (không xuất hiện trên Landing)

- ❌ Badge "ISSUE #42 · 連載中" — không đặt ở Landing (khác với đề xuất trước đó).
- ❌ Ô thứ 3 "History Begin" — bỏ hẳn, chỉ còn 2 ô About / Team Member.
- ❌ CTA "đọc chapter mới nhất" / preview bài viết mới — không có trên Landing. Muốn đọc nội dung, người dùng đi qua menu góc phải để vào Archive.
- ❌ Đường mạch điện tử trong wordmark.
- ❌ Bất kỳ section nào khác ngoài 4 thành phần ở mục 2 — Landing không cuộn.

---

## 4. Ghi chú khi đưa vào Claude Design

- Tham chiếu trực tiếp frame `index` đã duyệt trong file Figma "Design System" để lấy đúng token màu, font, style viền/panel, style icon — không mô tả lại màu sắc bằng lời, dùng thẳng style đã có.
- Trọng tâm việc cần làm: dựng 1 frame Landing mới, cấu trúc đúng 4 thành phần ở mục 2, đảm bảo không có phần tử nào ngoài scope ở mục 3.
- Layout: cân đối theo chiều dọc màn hình (menu trên cùng, wordmark ở khu vực trung tâm, 2 ô ngay dưới), đảm bảo toàn bộ vừa trong 1 viewport không cần cuộn ở kích thước desktop chuẩn.
