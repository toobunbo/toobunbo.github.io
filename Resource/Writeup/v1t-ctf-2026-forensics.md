---
title: "V1T CTF 2026 - Forensics Basic"
description: "Forensics Basic CTF - Writeup by Katsuo-3107"
author: "Katsuo-3107"
date: "2026-07-05"
categoryEn: "FORENSICS"
categoryJp: "フォレンジック"
difficulty: "medium"
tags: ["Forensics", "Wireshark", "Network"]
hot: false
cover: ""
---

# Forensics Basic CTF - Writeup
Tool: Wireshark

Flag: v1t{llm_c0uld_s0lv3_th1s_ez_chall3ng3!!!}

---

### 📌 Q1. Attacker IP & Victim IP
* **Yêu cầu:** Xác định IP của kẻ tấn công (Attacker) và nạn nhân (Victim).
* **Phương pháp giải:** * Sử dụng công cụ **Wireshark** để mở file lưu vết lịch sử mạng `.pcapng`.
  * Khi phân tích luồng dữ liệu (log), nhận thấy có rất nhiều IP xuất hiện. Tuy nhiên, khi kéo xuống gần giữa và cuối file, xuất hiện tần suất dày đặc của hai IP liên tục gửi các gói tin không hợp lệ cho nhau với tốc độ cực nhanh (tính bằng mili giây).
  * Hành vi gửi tin siêu tốc này chứng tỏ đây là hoạt động quét/tấn công tự động bằng công cụ (tool) chứ không phải do người dùng bình thường thao tác. Qua đó xác định được cặp IP này.
* **Đáp án:** `172.29.9.159,13.212.67.96`
<img width="2508" height="1037" alt="image" src="https://github.com/user-attachments/assets/e6c5ebdd-c648-4235-9bbd-6a211b0982f7" />

---

### 📌 Q2. What is the SSH protocol version and the distro of the victim?
* **Yêu cầu:** Tìm phiên bản giao thức SSH và hệ điều hành (Distro) của máy nạn nhân.
* **Phương pháp giải:** * Sử dụng bộ lọc (filter) trên Wireshark với từ khóa giao thức `ssh`.
  * Lọc kết hợp với địa chỉ IP của hai thực thể đã tìm thấy ở Q1 để thu hẹp phạm vi giao tiếp SSH giữa attacker và victim.
  * Kiểm tra các gói tin thiết lập kết nối ban đầu (SSH Handshake), thông tin banner sẽ hiển thị rõ phiên bản OpenSSH và tên bản phân phối OS.
* **Đáp án:** `SSH-2.0-OpenSSH_10.2p1 Ubuntu-2ubuntu3.2`
<img width="1313" height="473" alt="image" src="https://github.com/user-attachments/assets/d33e17cd-d7f4-42ba-a1e7-10f9a6046941" />

---

### 📌 Q3. What tool did the attacker use for reconnaissance (sending lots of TCP to victim ip very fast and a lot)?
* **Yêu cầu:** Công cụ nào được kẻ tấn công sử dụng để trinh sát, quét hàng loạt gói tin TCP đến IP nạn nhân một cách nhanh chóng?
* **Phương pháp giải:** * Xem xét kỹ cấu trúc dữ liệu của các gói tin TCP được gửi đi hàng loạt từ phía attacker.
  * Kiểm tra phần dữ liệu dạng Hex (thập lục phân) hoặc ASCII của gói tin, ta sẽ phát hiện các dấu hiệu đặc trưng của một công cụ quét mạng mã nguồn mở phổ biến chuyên dùng để rà quét cổng (port scanning).
* **Đáp án:** `nmap`
<img width="1995" height="932" alt="image" src="https://github.com/user-attachments/assets/224d4498-ce26-4c49-a5b9-07f96b5d4834" />

---

### 📌 Q4. Which TCP stream shows that the attacker successfully created a temporary admin account?
* **Yêu cầu:** Luồng TCP (TCP stream) nào cho thấy kẻ tấn công đã tạo thành công một tài khoản quản trị viên tạm thời?
* **Phương pháp giải:** * Mỗi luồng kết nối TCP trong Wireshark sẽ được định danh bằng một chỉ số `tcp.stream`.
  * Đi sâu vào phân tích các luồng HTTP, ta tìm thấy hành vi kẻ tấn công khai thác lỗ hổng **Command Injection** tại đường dẫn `/admin`.
  * Đoạn mã chứa hành vi cấp quyền tạm thời lộ diện qua cấu trúc JavaScript:
    ```javascript
    window.wpgmp_local = {
      nonce: "fc-call-nonce-7d91c2c0",
      ajaxurl: "/ajax/wpgmp_temp_access_ajax",
      support_action: "wpgmp_temp_access_ajax"
    };
    ```
  * Lọc kỹ các gói tin HTTP chứa phản hồi trả về, tìm các thông số có thuộc tính `temp...: true` và `role: admin`. Luồng chứa gói tin phản hồi thành công này chính là câu trả lời.
* **Đáp án:** `tcp.stream eq 4491`
<img width="2125" height="795" alt="image" src="https://github.com/user-attachments/assets/250be851-90b7-4140-be57-166f3d986831" />

---

### 📌 Q6. What is the CVE of the abused technique?
* **Yêu cầu:** Mã CVE của kỹ thuật/lỗ hổng bị lạm dụng ở trên là gì?
* **Phương pháp giải:** * Dựa vào các từ khóa khai thác thu được trong gói tin ở Q4 (như lỗ hổng tạo tài khoản admin tạm thời thông qua plugin), tra cứu CVE liên quan.
* **Đáp án:** `CVE-2026-8732`

---

### 📌 Q7. Which user-controlled parameter in the backup feature was abused to achieve RCE?
* **Yêu cầu:** Tham số nào do người dùng kiểm soát trong tính năng sao lưu (backup) đã bị lạm dụng để đạt được thực thi mã từ xa (RCE)?
* **Phương pháp giải:** * Phân tích hành vi duy trì quyền truy cập của attacker. Sau khi tài khoản admin tạm thời hết hạn, kẻ tấn công đã lợi dụng tính năng backup để chèn lệnh hệ thống hòng đọc file `secret.txt` và duy trì quyền admin.
  * Kiểm tra dữ liệu Payload gửi đi, phát hiện chuỗi chứa URL Encode với mã độc được nối vào: 
    `backup_name=daily-contracts%3B+cat+%2Fvar%2Ftmp%2Fsecret.txt`
  * Tham số bị chèn mã độc (thêm lệnh `; cat /var/tmp/secret.txt`) trực tiếp ở đây chính là tên bản sao lưu.
* **Đáp án:** `backup_name`

---

### 📌 Q8. What two files did the attacker read after gaining command execution?
* **Yêu cầu:** Hai file nào đã bị kẻ tấn công đọc ngay sau khi có quyền thực thi lệnh?
* **Phương pháp giải:** * Di chuyển xuống gần cuối file `.pcapng` để theo dõi các lệnh hệ thống tiếp theo của kẻ tấn công.
  * Tìm kiếm các hành vi sử dụng lệnh `cat` để đọc nội dung file. Phát hiện attacker đã thực hiện đọc thành công hai file `.env` chứa biến môi trường.
* **Đáp án:** `/app/templates/.env,/app/static/.env`
<img width="2197" height="570" alt="image" src="https://github.com/user-attachments/assets/0fc3f1f9-ac32-403c-884b-fe602acab503" />
<img width="2161" height="600" alt="image" src="https://github.com/user-attachments/assets/7fcc4f71-9c36-47c6-82f2-3c0f166dbc6c" />

---

### 📌 Q9. What is the found Github ID?
* **Yêu cầu:** ID (Username) GitHub tìm được trong quá trình điều tra là gì?
* **Phương pháp giải:** * Thực hiện **Follow TCP Stream** cho luồng HTTP tương ứng với đoạn attacker đọc file `secret.txt` hoặc hai file `.env` ở trên.
  * Dữ liệu trả về hiển thị thông tin rò rỉ mã token GitHub (GitHub Personal Access Token - PAT) với định dạng `Username:Token`:
    `Ich1ck3nPlus:github_pat_11CGUISKI0BilaSrVp2cCS_[REDACTED]`
  * Câu hỏi chỉ yêu cầu tìm GitHub ID (tức là Username).
* **Đáp án:** `Ich1ck3nPlus`
<img width="848" height="542" alt="image" src="https://github.com/user-attachments/assets/f71a74a7-7996-496d-a702-212611c2b2ba" />


Link Đề bài: https://basicqna.v1t.site
