---
title: "Nền Tảng x86-64 (AMD64) Assembly cho Reverse Engineering trên Windows"
description: "Cơ bản về Assembly x86-64 cho người học dịch ngược."
date: "2026.07.15"
author: "luongtrieudai"
categoryEn: "RESEARCH"
categoryJp: "研究"
difficulty: "hard"
tags: ["assembly", "reverse-engineering", "x64"]
hot: true
cover: "../thumbs/cover_vagabond.png"
---

# Nền Tảng x86-64 (AMD64) Assembly cho Reverse Engineering trên Windows

## Lý do tài liệu này tồn tại

Không ai học assembly vì nó dễ. Người ta học nó vì công cụ tự động có giới hạn, và khi con mã độc unpack xong, thứ duy nhất còn lại là một đống disassembly - hoặc bạn đọc được nó, hoặc bạn dừng lại.

Tài liệu này trả lời một câu: cần biết gì trước tiên khi mở x64dbg lên? Nó không thay Intel Manual. Từng dòng trong này hướng đến một mục đích - biến đống byte lạ hoắc thành một cấu trúc có quy tắc. Nếu đọc xong bạn vẫn thấy ASM là khó hiểu, tôi chịu thua.

## Lời mở đầu

Tài liệu này vừa là lộ trình học vừa là nội dung kiến thức, nên đọc tuần tự từ Phần 1 đến Phần 9, không nên nhảy cóc vì phần sau luôn xây dựng trên khái niệm đã giới thiệu ở phần trước. Một điều nên giữ trong đầu xuyên suốt: mỗi khi tài liệu giải thích một quy tắc, nó sẽ cố gắng trả lời luôn câu hỏi "vì sao lại thiết kế như vậy", chứ không chỉ liệt kê "quy tắc là gì". Lý do là phần lớn người mới học assembly gặp khó khăn không phải ở chỗ không nhớ nổi tên lệnh, mà ở chỗ khi gặp một đoạn disassembly thật sự thì không ghép được các mảnh kiến thức rời rạc lại thành một bức tranh có nghĩa. Hiểu lý do đằng sau mỗi quy tắc giúp việc ghép nối đó tự nhiên hơn nhiều.

## Phần 1: Mô hình thực thi của CPU và vì sao x86-64 trông có vẻ chắp vá

Trước khi đọc bất kỳ dòng `ASM` nào, cần nắm chắc một sự thật nền tảng: mọi tên biến, tên hàm, tên struct trong mã nguồn C hay C++ chỉ tồn tại trong lúc biên dịch. Sau khi trình biên dịch chạy xong, toàn bộ những cái tên đó biến mất, chỉ còn lại hai thứ duy nhất mà `CPU` thực sự nhìn thấy: thanh ghi (những ô nhớ cực nhanh nằm ngay trong `CPU`) và bộ nhớ (được truy cập bằng địa chỉ số học thuần túy). Khi một dòng `ASM` đọc "giá trị tại `RCX` cộng `0x20`", điều đó có thể tương ứng với việc truy cập một trường cụ thể trong một struct ở mã nguồn gốc, nhưng tên của trường đó đã biến mất, chỉ còn lại con số offset `0x20`.

Về mặt vận hành, `CPU` chỉ lặp đi lặp lại một vòng ba bước, hàng tỷ lần mỗi giây: lấy lệnh tại địa chỉ mà thanh ghi `RIP` đang trỏ tới (fetch), giải mã lệnh đó (decode), thực thi lệnh (execute) rồi tự động cập nhật `RIP` sang lệnh kế tiếp. Toàn bộ sự phức tạp của bất kỳ chương trình nào, dù đơn giản hay là cả một hệ điều hành, xét cho cùng chỉ là một chuỗi cực dài của vòng lặp ba bước này.

<img width="480" height="640" alt="intruction_cycle" src="https://github.com/user-attachments/assets/63201ffd-9528-43b5-aad4-692ea2002901" />

Một điểm lịch sử đáng nói ngay từ đầu, vì nó giải thích rất nhiều điều sẽ gặp sau này: x86-64 không phải một thiết kế hoàn toàn mới, mà là phần mở rộng của x86 32-bit, do AMD phát triển nên còn được gọi là AMD64, nhằm giải quyết một giới hạn cụ thể của x86 32-bit là không gian địa chỉ chỉ đánh được tối đa 4GB bộ nhớ, quá nhỏ so với nhu cầu máy tính hiện đại. Vì là phần mở rộng chứ không phải thiết kế lại từ đầu, x86-64 giữ nguyên toàn bộ tập lệnh cũ của x86 32-bit để bảo đảm tương thích ngược, và chỉ bổ sung thêm thanh ghi mới, cách địa chỉ hóa mới, cùng một quy ước gọi hàm hoàn toàn mới riêng cho Windows. Hiểu bối cảnh này giúp lý giải vì sao ASM x86-64 nhiều lúc trông như một tập hợp chắp vá của nhiều lớp thiết kế khác nhau, thay vì một hệ thống thuần nhất được vẽ ra từ con số không.

## Phần 2: Thanh ghi, và vì sao một thanh ghi lại có nhiều lớp

x86-64 có mười sáu thanh ghi đa dụng (general purpose registers) rộng 64-bit. Điều khiến người mới học bối rối nhất không phải là số lượng thanh ghi, mà là mỗi thanh ghi lại truy cập được ở nhiều độ rộng khác nhau.

| Thanh ghi 64-bit | 32-bit | 16-bit | 8-bit thấp | Vai trò theo quy ước |
|---|---|---|---|---|
| RAX | EAX | AX | AL | Giá trị trả về của hàm |
| RBX | EBX | BX | BL | Callee-saved, xem [Phần 6](#phần-6-stack-frame-và-windows-x64-calling-convention) |
| RCX | ECX | CX | CL | Tham số thứ nhất trên Windows x64 |
| RDX | EDX | DX | DL | Tham số thứ hai trên Windows x64 |
| RSI | ESI | SI | SIL | Nguồn trong lệnh xử lý chuỗi |
| RDI | EDI | DI | DIL | Đích trong lệnh xử lý chuỗi |
| RBP | EBP | BP | BPL | Gốc của stack frame hiện tại |
| RSP | ESP | SP | SPL | Đỉnh ngăn xếp hiện tại |
| R8 đến R15 | R8D đến R15D | R8W đến R15W | R8B đến R15B | R8, R9 là tham số thứ ba và thứ tư |

Vì sao một thanh ghi 64-bit lại chứa bên trong nhiều thanh ghi nhỏ hơn, thay vì mỗi độ rộng là một thanh ghi độc lập? Câu trả lời nằm ở lịch sử phát triển đã nhắc ở [Phần 1](#phần-1-mô-hình-thực-thi-của-cpu-và-vì-sao-x86-64-trông-có-vẻ-chắp-vá). Intel thiết kế 8086 (16-bit) trước, rồi mở rộng lên 386 (32-bit) bằng cách giữ nguyên tên thanh ghi cũ `AX` và thêm tiền tố `E` cho bản 32-bit thành `EAX`, sau đó AMD lặp lại chính cách làm đó thêm một lần nữa khi thêm tiền tố `R` cho bản 64-bit thành `RAX`. Kết quả là một chuỗi kế thừa ba lớp, không phải một thiết kế lý tưởng vẽ ra từ đầu mà là sản phẩm của ba lần mở rộng liên tiếp, mỗi lần đều phải giữ tương thích với mã máy đã biên dịch sẵn từ thế hệ trước.

Có một quy tắc bắt buộc phải nhớ và thường khiến người mới học bất ngờ: khi ghi vào phần 32-bit của một thanh ghi, ví dụ lệnh `MOV EAX,...,` phần cao còn lại của thanh ghi 64-bit sẽ tự động bị xóa về 0, gọi là `zero-extend`. Ngược lại, ghi vào phần 16-bit hoặc 8-bit thì phần cao được giữ nguyên không đổi. Đây không phải một chi tiết vụn vặt có thể bỏ qua, mà là một quyết định thiết kế có chủ đích: quy tắc `zero-extend` giúp `CPU` tránh một vấn đề hiệu năng gọi là `partial register stall`, tức tình trạng `CPU` phải chờ đợi vì không biết chắc giá trị phần cao thanh ghi đang là gì, do một lệnh trước đó ghi vào phần thấp mà không đụng tới phần cao. Nhờ quy tắc này, mỗi khi một lệnh ghi ở dạng 32-bit, `CPU` biết chắc toàn bộ thanh ghi 64-bit đã ở trạng thái xác định, không cần chờ giá trị cũ. Đây cũng là lý do trình biên dịch dùng `MOV EAX` rất nhiều thay vì `MOV RAX` ngay cả trong một hàm 64-bit: nếu giá trị chỉ cần 32-bit thì dùng dạng `EAX` vừa ngắn hơn vừa tránh được chi phí hiệu năng không cần thiết.

Để thấy quy tắc này bằng số liệu cụ thể, giả sử RAX đang mang giá trị 0xFFFFFFFF12345678 trước khi thực hiện hai lệnh sau:

```nasm
MOV EAX, 0xAABBCCDD
; sau lệnh này, RAX = 0x00000000AABBCCDD, toàn bộ 4 byte cao bị xoá về 0
MOV AX, 0x1111
; sau lệnh này, RAX = 0x00000000AABB1111, chỉ 2 byte thấp nhất đổi, phần còn lại giữ nguyên
```

Dòng đầu tiên minh họa rõ nhất quy tắc `zero-extend`: dù chỉ ghi 4 byte thấp, toàn bộ 4 byte cao của `RAX`, tức phần `0xFFFFFFFF` ban đầu, bị xóa sạch về 0 chứ không được giữ lại. Dòng thứ hai thì ngược lại, chỉ 2 byte thấp nhất đổi thành `0x1111`, còn phần `0xAABBCCDD` phía trên trừ 2 byte thấp vẫn giữ nguyên như ngay sau lệnh đầu. Đây chính là sự khác biệt then chốt giữa ghi ở độ rộng 32-bit và ghi ở độ rộng 16-bit hoặc 8-bit đã nói ở trên.

Ngoài các thanh ghi đa dụng, `RIP` luôn trỏ tới lệnh kế tiếp sẽ được thực thi và không thể gán giá trị trực tiếp bằng `MOV`, chỉ thay đổi được qua các lệnh nhảy như `JMP`, `CALL`, hoặc `RET`. Thanh ghi `RFLAGS` lưu các cờ trạng thái quyết định lệnh nhảy có điều kiện, đây là một trong những phần quan trọng nhất của toàn tài liệu và được bàn kỹ ở [Phần 5](#phần-5-cờ-trạng-thái-rflags-và-nhảy-có-điều-kiện).

Về các thanh ghi segment gồm `CS`, `DS`, `SS`, `ES`, `FS`, `GS`, phần lớn đã mất ý nghĩa phân đoạn bộ nhớ từ thời x86 16-bit, nhưng trên Windows, thanh ghi `GS` vẫn được dùng có chủ đích: biểu thức `GS:[0x30]` hoặc `GS:[0x60]` trỏ tới `TEB`, tức Thread Environment Block, của thread hiện tại. Đây là một chi tiết đặc thù Windows sẽ lặp lại nhiều lần trong quá trình đọc mã, đặc biệt khi phân tích shellcode hoặc loader tự viết tay. Nếu muốn tra cứu sâu hơn về mọi thanh ghi, chương 3 của Intel 64 and IA-32 Architectures Software Developer's Manual, tập 1, mô tả đầy đủ nhất.

## Phần 3: Bộ nhớ, cách địa chỉ hóa và ngăn xếp

Cú pháp chung khi một lệnh `ASM` truy cập bộ nhớ, theo kiểu cú pháp Intel dùng trong `IDA`, `x64dbg` và `Ghidra`, là base cộng chỉ số nhân hệ số tỷ lệ cộng độ lệch, viết thành `[base + index*scale + displacement]`. Lấy lại đúng ví dụ đã gặp ở đoạn ASM ntdll trước đây trong cuộc trò chuyện:

```nasm
MOV R10D, DWORD PTR DS:[RCX+0x20]
```

đọc là lấy giá trị 32-bit (`DWORD`) tại địa chỉ bằng giá trị trong `RCX` cộng `0x20`, rồi gán vào `R10D`. Đây chính là cách `ASM` biểu diễn việc truy cập một trường trong một struct: `RCX` đóng vai trò con trỏ tới struct, còn `0x20` là độ lệch (offset) của trường đó so với điểm bắt đầu struct. Không còn tên trường nào sống sót sau khi biên dịch, nên nhiệm vụ của người làm reverse engineering nhiều khi chính là đoán lại ý nghĩa của từng offset dựa vào cách nó được sử dụng ở những chỗ khác trong hàm.

Một bổ sung quan trọng riêng cho x64, không tồn tại ở x86 32-bit, là cách địa chỉ hóa tương đối theo `RIP`, ví dụ `MOV RAX, [RIP+0x2045]` nghĩa là địa chỉ đích bằng `RIP` hiện tại cộng `0x2045`. Trình biên dịch dùng dạng này rất nhiều để truy cập biến toàn cục hoặc hằng số, và lý do không chỉ là tiện lợi mà còn liên quan trực tiếp tới `ASLR`, tức Address Space Layout Randomization, cơ chế hệ điều hành xáo trộn ngẫu nhiên địa chỉ nền của module mỗi lần chương trình khởi động nhằm mục đích bảo mật. Nếu mã máy dùng địa chỉ tuyệt đối cố định, nó sẽ sai ngay khi module được nạp ở một địa chỉ khác trong lần chạy kế tiếp. Ngược lại, địa chỉ hóa theo `RIP` khiến đoạn mã trở thành độc lập vị trí, vì khoảng cách từ lệnh hiện tại đến biến cần truy cập là một con số cố định bất kể module được nạp ở đâu, chỉ có `RIP` thay đổi còn độ lệch thì không. Đây là lý do gần như mọi truy cập biến toàn cục trong mã biên dịch hiện đại trên x64 đều đi qua RIP-relative thay vì địa chỉ tuyệt đối trực tiếp.

Về ngăn xếp, có ba điều bắt buộc phải nắm trước khi đọc sang quy ước gọi hàm ở [Phần 6](#phần-6-stack-frame-và-windows-x64-calling-convention). Thứ nhất, ngăn xếp phát triển từ địa chỉ cao xuống địa chỉ thấp, nghĩa là lệnh `PUSH` làm `RSP` giảm đi, còn `POP` làm `RSP` tăng lên, điều này ngược với trực giác thông thường khi nghĩ về một ngăn xếp theo nghĩa đời thường. Thứ hai, `PUSH` một thanh ghi về mặt ngữ nghĩa tương đương với trừ `RSP` đi tám byte rồi ghi giá trị thanh ghi đó vào địa chỉ `RSP` mới, còn `POP` thì làm ngược lại. Thứ ba, thanh ghi `RBP`, khi được dùng làm frame pointer, trỏ tới một điểm cố định trong stack frame của hàm hiện tại, giúp truy cập tham số và biến cục bộ bằng một offset cố định dù `RSP` có thay đổi liên tục trong lúc hàm đang chạy do các thao tác `push` hoặc `pop` tạm thời. Tuy nhiên, nhiều trình biên dịch hiện đại, bao gồm `MSVC`, thường tối ưu bỏ hoàn toàn việc dùng `RBP` làm frame pointer, kỹ thuật này gọi là `frame pointer omission`, và dùng thẳng `RSP` với các offset đã tính sẵn từ lúc biên dịch, vì giải phóng `RBP` khỏi vai trò cố định nghĩa là có thêm một thanh ghi đa dụng nữa có thể dùng tự do cho tính toán. Vì vậy, nếu không thấy lệnh `PUSH RBP` ngay đầu một hàm, đừng vội kết luận hàm đó không có stack frame.

Một chi tiết dễ bị bỏ sót nếu chỉ đọc tài liệu không phân biệt rõ hệ điều hành: trên Windows, không tồn tại khái niệm `red zone`. Trên các hệ điều hành họ Unix như Linux hay macOS, quy ước gọi hàm System V AMD64 ABI dành riêng một vùng 128 byte ngay bên dưới `RSP` mà các hàm lá, tức hàm không gọi hàm nào khác, có thể dùng tạm mà không cần điều chỉnh `RSP` trước, giúp tối ưu tốc độ cho những hàm rất ngắn. `Windows x64 ABI` không có điều này: vùng bộ nhớ ngay dưới `RSP` được xem là không ổn định và có thể bị hệ điều hành, trình gỡ lỗi, hoặc trình xử lý ngắt ghi đè bất cứ lúc nào. Nếu từng đọc tài liệu hoặc ví dụ viết cho Linux rồi áp dụng nguyên xi sang phân tích một `binary` Windows, đây là một trong những điểm dễ dẫn tới kết luận sai nhất. Bài viết *Guide to x86 Assembly* của University of Virginia trình bày trực quan addressing mode và ngăn xếp theo đúng hướng vừa nêu, dù viết cho x86 32-bit thì khái niệm vẫn áp dụng gần như nguyên vẹn cho x64.

## Phần 4: Hệ thống lệnh nền tảng, theo nhóm chức năng

Cách học hiệu quả không phải là thuộc lòng từng lệnh rời rạc, mà là nhóm theo chức năng, vì trong cùng một nhóm các lệnh chia sẻ chung một logic nền.

Nhóm di chuyển dữ liệu gồm `MOV`, tức sao chép giá trị mà không tính toán gì, và `LEA`, viết tắt của Load Effective Address. Điểm cần phân biệt rõ: `MOV` đọc giá trị tại địa chỉ trong bộ nhớ, còn `LEA` chỉ tính công thức địa chỉ hóa rồi gán kết quả vào thanh ghi đích, hoàn toàn không chạm vào bộ nhớ. Chính vì `LEA` thực chất chỉ là một phép tính toán học trên các thanh ghi, trình biên dịch hay mượn nó để làm phép cộng hoặc nhân đơn giản không liên quan gì tới địa chỉ, ví dụ `LEA EAX, [RBX+RBX*2]` thực chất chỉ để tính `EAX` bằng `RBX` nhân ba, vì đây là mã máy ngắn hơn và nhanh hơn so với dùng lệnh nhân `MUL` riêng.

Nhóm số học gồm `ADD`, `SUB`, `INC`, `DEC`, `NEG` để đổi dấu, `MUL` và `IMUL` để nhân không dấu và có dấu, `DIV` và `IDIV` để chia không dấu và có dấu, trong đó phép chia dùng cặp thanh ghi `RDX` ghép với `RAX` làm số bị chia. Nhóm logic theo bit gồm `AND`, `OR`, `XOR`, `NOT`, các lệnh dịch bit `SHL` và `SHR` là dịch logic, `SAR` là dịch số học có giữ nguyên bit dấu, và các lệnh xoay bit `ROL`, `ROR`.

Có hai mẹo đọc mã mà trình biên dịch hay dùng, và nếu không biết trước sẽ dễ hiểu nhầm ý nghĩa thực sự của đoạn mã. Lệnh `XOR EAX, EAX` gần như luôn mang ý nghĩa đơn giản là gán `EAX` bằng 0, vì `XOR` một giá trị với chính nó luôn cho kết quả 0, và mã máy của `XOR` ngắn hơn so với `MOV EAX, 0`. Một lý do sâu xa hơn ít được nhắc tới là `XOR reg, reg` còn giúp bộ xử lý nhận ra đây là một phép đặt lại trạng thái hoàn toàn độc lập với giá trị cũ của thanh ghi, giúp cơ chế thực thi không theo thứ tự, gọi là `out-of-order execution`, không phải chờ giá trị cũ được tính xong trước đó, vì kết quả chắc chắn luôn là 0 bất kể giá trị đầu vào trước đó là gì. Tương tự, lệnh `OR EBX, 0xFFFFFFFF`, đúng mẫu đã gặp trong đoạn ASM ntdll ở lượt hỏi trước, mang ý nghĩa gán `EBX` bằng âm một, vì phép `OR` với một giá trị toàn bit 1 luôn cho kết quả toàn bit 1, và biểu diễn nhị phân của âm một theo bù hai chính là toàn bit 1.

Nhóm so sánh và rẽ nhánh gồm `CMP` để so sánh, chỉ thay đổi cờ trạng thái chứ không lưu kết quả ở đâu cả, `TEST` thường dùng để kiểm tra một giá trị có bằng 0 hay không hoặc kiểm tra một bit cụ thể thông qua phép `AND` ngầm, `JMP` để nhảy vô điều kiện, các lệnh nhảy có điều kiện trình bày chi tiết ở [Phần 5](#phần-5-cờ-trạng-thái-rflags-và-nhảy-có-điều-kiện), cùng `CALL` và `RET` dùng để gọi hàm và trả về. Ngoài ra còn có nhóm lệnh xử lý chuỗi như `MOVSB`, `STOSB`, `CMPSB`, thường đi kèm tiền tố `REP` để lặp lại nhiều lần. Đây chính là cách mã máy biểu diễn các vòng lặp sao chép hoặc so sánh mảng byte mà trong C tương ứng với các hàm như `memcpy` hay `memcmp`, nên khi thấy một đoạn lệnh có `REP MOVSB`, có thể đoán ngay đây rất có thể là một lời gọi `memcpy` đã được trình biên dịch nội tuyến trực tiếp thay vì gọi hàm riêng.

Về mặt mã hóa lệnh, mỗi lệnh x86-64 có thể đi kèm một tiền tố gọi là `REX prefix`. Đây chính là cơ chế cho phép truy cập tám thanh ghi mới `R8` đến `R15`, vì mã lệnh gốc của x86 32-bit chỉ dành đủ số bit để đánh địa chỉ tám thanh ghi cũ, không còn chỗ để thêm thanh ghi mới nếu không có tiền tố này, và `REX` cũng là cơ chế cho phép mở rộng độ rộng toán tử lên 64-bit thông qua bit `REX.W`. Đây là lý do một vài disassembler hiển thị một byte tiền tố riêng trước lệnh chính khi lệnh đó làm việc với `R8` trở lên hoặc làm việc ở độ rộng 64-bit, còn nếu chỉ làm việc với `EAX` tới `EDI` ở độ rộng 32-bit thì không cần tiền tố này. Khi cần tra cứu chính xác hoạt động của một lệnh cụ thể chưa quen mặt, [felixcloutier.com/x86](https://felixcloutier.com/x86) là nơi nên mở ra đầu tiên, vì đây sẽ là trang được ghé thăm thường xuyên nhất trong suốt quá trình học.

Các ví dụ dưới đây minh họa lại đúng những gì vừa nêu, dùng `ASM` được sinh ra khi bật tối ưu hóa, tương ứng cờ `/O2` của `MSVC`. Nếu biên dịch ở chế độ Debug mặc định `/Od`, mã sẽ dài hơn nhiều vì trình biên dịch lưu từng biến ra ngăn xếp một cách máy móc, thiếu hẳn các mẹo tối ưu sẽ thấy dưới đây. Xét hàm C sau:

```c
int add_and_scale(int a, int b) {
    int total = a + b;
    return total * 3;
}
```

Trên Windows x64, `a` nằm trong `ECX` và `b` nằm trong `EDX`, xem lại [Phần 6](#phần-6-stack-frame-và-windows-x64-calling-convention). `MSVC` ở chế độ tối ưu thường sinh ra:

```nasm
add_and_scale:
    LEA     EAX, [RDX+RCX]      ; EAX bằng b cộng a, gộp phép cộng vào một lệnh LEA thay vì dùng ADD
    LEA     EAX, [RAX+RAX*2]    ; EAX bằng RAX cộng RAX nhân hai, tức (a+b) nhân ba
    RET
```

Hai điều đáng chú ý. Dòng đầu dùng `LEA` để cộng hai thanh ghi trong đúng một lệnh, dù về bản chất đây là phép cộng số học chứ không phải tính địa chỉ, đúng mẹo mượn `LEA` đã nói ở trên. Dòng thứ hai dùng dạng `RAX` cộng `RAX` nhân hai, cho ra `RAX` nhân ba, thay cho một lệnh nhân `IMUL` vốn tốn nhiều chu kỳ hơn.

Ví dụ tiếp theo minh họa mẹo XOR reg, reg cho một hàm luôn trả về 0:

```c
int always_zero(void) {
    return 0;
}
```

```nasm
always_zero:
    XOR     EAX, EAX    ; EAX bằng không, ngắn hơn MOV EAX, 0 và không phụ thuộc giá trị cũ của EAX
    RET
```

Cuối cùng, ví dụ cho REP MOVSB, minh họa cách trình biên dịch nội tuyến một lời gọi memcpy có kích thước cố định và đủ nhỏ:

```c
void copy_16_bytes(char* dst, char* src) {
    memcpy(dst, src, 16);
}
```

```nasm
copy_16_bytes:
    MOV     RDI, RCX    ; RDI nhận dst, tham số thứ nhất; REP MOVSB bắt buộc dùng RDI làm đích
    MOV     RSI, RDX    ; RSI nhận src, tham số thứ hai; REP MOVSB bắt buộc dùng RSI làm nguồn
    MOV     ECX, 16     ; số byte cần sao chép, đặt vào ECX để làm bộ đếm lặp cho REP
    REP     MOVSB       ; lặp 16 lần, sao một byte từ RSI sang RDI, tự động tăng cả hai
    RET
```

Chú ý là `RDI` và `RSI` phải được nạp lại đúng vai trò nguồn và đích mà `REP MOVSB` yêu cầu, dù quy ước gọi hàm bình thường không bắt buộc phải dùng đúng hai thanh ghi đó cho tham số; đây là một quy ước riêng của chính lệnh `REP MOVSB`, tách biệt hoàn toàn với calling convention nói ở [Phần 6](#phần-6-stack-frame-và-windows-x64-calling-convention).

## Phần 5: Cờ trạng thái RFLAGS và nhảy có điều kiện

Đây là phần quyết định có đọc hiểu được cấu trúc if/else hay vòng lặp hay không, không được học qua loa.

Bốn cờ quan trọng nhất cần nắm: `ZF`, tức Zero Flag, báo hiệu kết quả phép toán bằng 0; `SF`, tức Sign Flag, báo hiệu bit dấu của kết quả là 1, tức kết quả âm nếu coi là số có dấu; `CF`, tức Carry Flag, báo hiệu có nhớ hoặc mượn ở phép toán không dấu; và `OF`, tức Overflow Flag, báo hiệu có tràn số ở phép toán có dấu. Lệnh `CMP a, b` thực chất thực hiện phép trừ a trừ b ở bên trong, rồi đặt các cờ theo kết quả đó, nhưng không lưu kết quả phép trừ vào bất kỳ đâu, chỉ dùng để chuẩn bị cho lệnh nhảy có điều kiện ngay sau nó.

Bảng ánh xạ dưới đây có lẽ là bảng quan trọng nhất toàn tài liệu:

| Lệnh nhảy | Điều kiện sau CMP a, b | Dùng cho |
|---|---|---|
| JE hoặc JZ | ZF = 1 | a bằng b |
| JNE hoặc JNZ | ZF = 0 | a khác b |
| JG | ZF = 0 và SF = OF | a lớn hơn b, có dấu |
| JGE | SF = OF | a lớn hơn hoặc bằng b, có dấu |
| JL | SF khác OF | a nhỏ hơn b, có dấu |
| JLE | ZF = 1 hoặc SF khác OF | a nhỏ hơn hoặc bằng b, có dấu |
| JA | CF = 0 và ZF = 0 | a lớn hơn b, không dấu |
| JAE | CF = 0 | a lớn hơn hoặc bằng b, không dấu |
| JB | CF = 1 | a nhỏ hơn b, không dấu |
| JBE | CF = 1 hoặc ZF = 1 | a nhỏ hơn hoặc bằng b, không dấu |

Điểm quan trọng nhất rút ra từ bảng trên không phải là thuộc lòng từng dòng, mà là nhận ra `JG` và `JL`, dành cho so sánh có dấu, cùng `JA` và `JB`, dành cho so sánh không dấu, là hai bộ lệnh hoàn toàn khác nhau, dựa trên các tổ hợp cờ khác nhau. Khi thấy một đoạn mã dùng `JA` hoặc `JB` thay vì `JG` hoặc `JL`, điều đó có nghĩa trình biên dịch biết chắc chắn hai giá trị đang so sánh không bao giờ mang ý nghĩa âm, chẳng hạn như so sánh chỉ số mảng hoặc kích thước buffer, những đại lượng về bản chất không thể âm. Đây chính xác là mẫu đã gặp trong đoạn `ASM` ntdll ở lượt hỏi trước: lệnh `CMP R11D, EAX` rồi `JA` ngay sau đó cho thấy hai giá trị `R11D` và `EAX` ở đó đang biểu diễn một chỉ số hoặc một giới hạn, không phải một số có thể mang giá trị âm, nên trình biên dịch chọn dùng `JA` thay vì `JG`. Đây không phải một sự tình cờ, mà là một dấu vết trực tiếp cho biết kiểu dữ liệu gốc trong mã nguồn C hoặc C++ là một kiểu không dấu, thường là `size_t` hoặc `unsigned int`.

Để thấy rõ cơ chế này bằng số liệu cụ thể, xét đoạn ASM sau với EAX đang mang giá trị 5 và EBX đang mang giá trị 3:

```nasm
CMP EAX, EBX    ; thực hiện nội bộ phép trừ 5 - 3 = 2
JG  label_greater
```

Kết quả nội bộ của phép trừ là 2, một số dương khác 0, nên `ZF = 0` vì kết quả khác 0, `SF = 0` vì bit dấu của 2 là 0, và không có tràn số nên `OF = 0`. Theo bảng ở trên, `JG` nhảy khi `ZF = 0` và `SF = OF`; ở đây cả hai đều bằng 0 nên điều kiện đúng, lệnh `JG` sẽ nhảy tới `label_greater`, đúng như kỳ vọng vì 5 lớn hơn 3.

Bây giờ xét trường hợp hay gây nhầm lẫn nhất cho người mới học, minh họa đúng lý do vì sao so sánh có dấu và không dấu phải tách thành hai bộ lệnh khác nhau. Giả sử EAX mang giá trị 1 và EBX mang giá trị 0xFFFFFFFF:

```nasm
CMP EAX, EBX    ; 1 - 0xFFFFFFFF, có mượn nên CF = 1
JG  label_greater
JB  label_below
```

Nếu coi `0xFFFFFFFF` là số có dấu, giá trị đó chính là -1, nên về mặt có dấu, 1 lớn hơn -1, và `JG` sẽ nhảy tới `label_greater`, vì lúc này `SF = 0`, `OF = 0`, hai giá trị bằng nhau nên điều kiện `JG` đúng. Nhưng nếu coi `0xFFFFFFFF` là số không dấu, giá trị đó là một số cực lớn, 4294967295, nên về mặt không dấu, 1 nhỏ hơn `0xFFFFFFFF` rất nhiều, phép trừ có mượn nên `CF = 1`, và `JB` sẽ nhảy tới `label_below`. Cùng một cặp bit y hệt nhau trong hai thanh ghi, nhưng `JG` và `JB` cho ra hai kết luận trái ngược nhau, chỉ vì chúng diễn giải cùng một chuỗi bit theo hai quy tắc khác nhau, có dấu và không dấu. Đây chính xác là lý do trình biên dịch phải chọn đúng bộ lệnh nhảy dựa theo kiểu dữ liệu khai báo trong mã nguồn C, và cũng là lý do người đọc `ASM` phải suy ngược lại kiểu dữ liệu gốc từ việc quan sát `JG`/`JL` hay `JA`/`JB` xuất hiện trong đoạn mã. Hai trang [felixcloutier.com/x86/cmp](https://felixcloutier.com/x86/cmp) và [felixcloutier.com/x86/jcc](https://felixcloutier.com/x86/jcc) mô tả chính xác nhất toàn bộ bảng vừa nêu, nên tham khảo trực tiếp nếu còn điểm nào chưa chắc.

## Phần 6: Stack Frame và Windows x64 Calling Convention

Đây là phần mang tính đặc thù rất cao cho Windows, khác hẳn Linux vốn dùng System V AMD64 ABI, nên nếu từng đọc một tài liệu tổng quát không ghi rõ hệ điều hành đang nói tới, rất dễ nhầm lẫn.

Một điểm đáng chú ý về lịch sử thiết kế: trên x86 32-bit, thế giới calling convention khá rối rắm với nhiều lựa chọn khác nhau như `cdecl`, `stdcall`, `fastcall`, `thiscall`, mỗi loại có quy tắc riêng về việc ai dọn dẹp ngăn xếp và tham số được truyền như thế nào. Khi chuyển sang x64, Microsoft quyết định đơn giản hóa triệt để bằng cách chỉ còn dùng một quy ước gọi hàm duy nhất cho toàn bộ hệ thống, bất kể hàm được khai báo là `stdcall` hay `fastcall` trong mã nguồn C, tất cả đều được biên dịch ra cùng một quy ước. Đây là quyết định hợp lý xét trên bối cảnh x64 có nhiều thanh ghi hơn hẳn x86 32-bit, mười sáu thanh ghi đa dụng so với tám, nên truyền tham số qua thanh ghi thay vì qua ngăn xếp trở nên khả thi và hiệu quả hơn nhiều, và không còn lý do gì để duy trì nhiều quy ước khác nhau nữa.

| Thứ tự tham số | Số nguyên hoặc con trỏ | Số thực |
|---|---|---|
| 1 | RCX | XMM0 |
| 2 | RDX | XMM1 |
| 3 | R8 | XMM2 |
| 4 | R9 | XMM3 |
| Từ 5 trở đi | Trên ngăn xếp, phải sang trái | Trên ngăn xếp |

Giá trị trả về kiểu số nguyên hoặc con trỏ nằm trong `RAX`; giá trị trả về kiểu số thực nằm trong `XMM0`.

Một chi tiết dễ gây nhầm lẫn cho người mới học là `shadow space`, còn gọi là `home space`. Trên Windows x64, bên gọi (caller) luôn phải tự cấp phát sẵn 32 byte trên ngăn xếp ngay trước khi thực hiện lệnh `CALL`, dù hàm được gọi có dùng hết bốn tham số hay không. Đây là lý do luôn thấy mẫu lệnh quen thuộc:

```nasm
SUB RSP, 0x28    ; 0x20 là 32 byte shadow space, cộng 0x8 để căn chỉnh alignment 16-byte
CALL SomeFunction
ADD RSP, 0x28
```

Mục đích của vùng `shadow space` là để hàm được gọi có sẵn chỗ đổ bốn thanh ghi tham số ra ngăn xếp nếu cần, điều này đặc biệt hữu ích với các hàm nhận số lượng tham số biến đổi, gọi là `variadic function`, hoặc khi gỡ lỗi, vì nó cho một vị trí cố định trên ngăn xếp để tìm tham số dù thanh ghi có thể đã bị tái sử dụng cho mục đích khác trong lúc hàm chạy.

Để thấy toàn bộ cơ chế trên trong một ví dụ đầy đủ, xét một hàm C nhận năm tham số kiểu long long, đủ để thấy cả cách truyền qua thanh ghi lẫn qua ngăn xếp:

```c
long long sum_five(long long a, long long b, long long c, long long d, long long e) {
    return a + b + c + d + e;
}
```

Bốn tham số đầu `a`, `b`, `c`, `d` lần lượt nằm trong `RCX`, `RDX`, `R8`, `R9` theo đúng bảng ở trên; tham số thứ năm `e` không còn thanh ghi nào để dùng nên nằm trên ngăn xếp, ngay phía trên `shadow space` của lời gọi hàm này. Đoạn `ASM` tương ứng, đã bật tối ưu hóa, sẽ gần giống thế này:

```nasm
sum_five:
    MOV     RAX, RCX            ; RAX nhận a
    ADD     RAX, RDX            ; RAX = a cộng b
    ADD     RAX, R8             ; RAX = a cộng b cộng c
    ADD     RAX, R9             ; RAX = a cộng b cộng c cộng d
    ADD     RAX, [RSP+0x28]     ; cộng nốt tham số thứ năm e, đang nằm trên ngăn xếp
    RET
```

```text
        +---------------------------+
RSP →   |  địa chỉ trả về          | [RSP+0x00]
        +---------------------------+
        |  shadow RCX              | [RSP+0x08]
        +---------------------------+
        |  shadow RDX              | [RSP+0x10]
        +---------------------------+
        |  shadow R8               | [RSP+0x18]
        +---------------------------+
        |  shadow R9               | [RSP+0x20]
        +---------------------------+
        |  tham số 5 (e)           | [RSP+0x28]
        +---------------------------+
              ↑ địa chỉ tăng dần
```

---

Điểm cần chú ý ở dòng cuối: địa chỉ `RSP` cộng `0x28` không phải ngẫu nhiên. Khi `CPU` vừa vào hàm, giá trị đầu tiên trên đỉnh ngăn xếp luôn là địa chỉ trả về do lệnh `CALL` tự động đẩy vào, chiếm 8 byte; ngay phía trên địa chỉ trả về đó là 32 byte `shadow space` do bên gọi cấp phát. Vì vậy tham số thứ năm, nằm ngay sau `shadow space` của chính lời gọi này, rơi đúng vào offset `0x28` tính từ `RSP`, tức 8 byte của địa chỉ trả về cộng `0x20` byte của `shadow space`.

Nếu hàm này còn cần dùng thêm một thanh ghi non-volatile, ví dụ `RBX`, để tính toán, phần đầu và cuối hàm sẽ có thêm một cặp `PUSH` và `POP` tương ứng:

```nasm
sum_five_v2:
    PUSH    RBX                 ; lưu giá trị gốc của RBX, thuộc nhóm non-volatile, trước khi dùng
    MOV     RBX, RCX
    ADD     RBX, RDX
    ADD     RBX, R8
    ADD     RBX, R9
    ADD     RBX, [RSP+0x30]     ; chú ý offset đã đổi thành 0x30 vì PUSH RBX làm RSP giảm thêm 8
    MOV     RAX, RBX
    POP     RBX                 ; khôi phục giá trị gốc của RBX trước khi trả về
    RET
```

```text
        +---------------------------+
RSP →   |  RBX (giá trị gốc)       | [RSP+0x00]
        +---------------------------+
        |  địa chỉ trả về          | [RSP+0x08]
        +---------------------------+
        |  shadow RCX              | [RSP+0x10]
        +---------------------------+
        |  shadow RDX              | [RSP+0x18]
        +---------------------------+
        |  shadow R8               | [RSP+0x20]
        +---------------------------+
        |  shadow R9               | [RSP+0x28]
        +---------------------------+
        |  tham số 5 (e)           | [RSP+0x30]
        +---------------------------+
              ↑ địa chỉ tăng dần
```

---

So sánh hai phiên bản cho thấy một điểm quan trọng thường bị bỏ sót: ngay sau khi `PUSH RBX`, `RSP` đã giảm thêm 8 byte, nên mọi offset tính từ `RSP` để truy cập tham số trên ngăn xếp cũng phải cộng thêm đúng 8 byte, từ `0x28` thành `0x30`. Đây là lý do khi đọc một hàm thật có nhiều lệnh `PUSH` ở đầu, cần cộng dồn chính xác số byte đã bị đẩy vào ngăn xếp trước khi tin vào bất kỳ offset `RSP` cộng gì đó xuất hiện sau đó.

Về việc ai chịu trách nhiệm bảo toàn giá trị thanh ghi:

| Loại | Thanh ghi | Ý nghĩa |
|---|---|---|
| Volatile, caller-saved | RAX, RCX, RDX, R8 đến R11, XMM0 đến XMM5 | Callee được phép ghi đè tự do; nếu caller cần giữ giá trị sau khi gọi hàm, caller phải tự lưu trước |
| Non-volatile, callee-saved | RBX, RBP, RDI, RSI, R12 đến R15 | Nếu callee dùng các thanh ghi này, callee phải PUSH lúc đầu hàm và POP trước khi trả về, trả nguyên giá trị gốc |

Sự phân chia này không phải một quy tắc tùy tiện, mà là một thỏa thuận giúp tối ưu hiệu năng: nếu mọi thanh ghi đều phải được bảo toàn, mỗi hàm sẽ phải `push` và `pop` rất nhiều dù không cần thiết; còn nếu không thanh ghi nào được bảo toàn, bên gọi sẽ phải tự lưu mọi thứ trước mỗi lời gọi hàm dù chỉ dùng một vài thanh ghi. Chia làm hai nhóm cho phép cả hai phía chỉ làm đúng phần việc cần thiết cho mình.

Đây chính là lý do giải thích dòng đầu tiên trong đoạn `ASM` đã hỏi ở lượt trước, lệnh `MOV QWORD PTR SS:[RSP+0x8], RBX`: hàm đó sắp dùng `RBX` làm biến tạm bên trong thân hàm, mà `RBX` thuộc nhóm non-volatile, nên nó phải lưu giá trị gốc của `RBX`, vốn là tài sản của bên gọi, vào ngăn xếp trước, để sau này khôi phục lại đúng giá trị đó trước khi trả về, đúng theo thỏa thuận callee-saved đã nêu trên. Trang chính thức của Microsoft tại [learn.microsoft.com](https://learn.microsoft.com), tìm với từ khóa `x64 calling convention`, trình bày đầy đủ và chính xác nhất về cách truyền tham số và bảo toàn thanh ghi vừa nêu.

## Phần 7: Nhận diện pattern trong mã compiler

Sau khi nắm vững Phần 1 đến Phần 6, bước tiếp theo là tập nhận diện hình dạng quen thuộc thay vì dịch từng dòng một cách máy móc.

Cấu trúc `if/else` thường hiện ra dưới dạng một lệnh `CMP` hoặc `TEST` đi kèm một lệnh nhảy có điều kiện nhảy qua nhánh `else` nếu điều kiện `if` sai, và kết thúc nhánh `if` bằng một lệnh `JMP` vô điều kiện để nhảy qua khỏi nhánh `else`. Vòng lặp `for` hoặc `while` thường có một biến đếm được tăng hoặc giảm bằng `INC`, `DEC`, hoặc `ADD`, một lệnh `CMP` so sánh với điều kiện dừng, và một lệnh nhảy có điều kiện quay về đầu vòng lặp; dấu hiệu dễ nhận biết nhất là lệnh nhảy đó trỏ tới một địa chỉ nhỏ hơn địa chỉ hiện tại, tức nhảy lùi về phía trước trong luồng lệnh.

Ví dụ cụ thể cho if/else, với một hàm chọn giá trị lớn hơn giữa hai số:

```c
int max_of_two(int a, int b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}
```

```nasm
max_of_two:
    CMP     ECX, EDX        ; so sánh a (ECX) với b (EDX)
    JG      return_a        ; nếu a lớn hơn b theo kiểu có dấu, nhảy tới nhánh trả về a
    MOV     EAX, EDX        ; nhánh else được thực thi tiếp, không cần nhảy: EAX = b
    RET
return_a:
    MOV     EAX, ECX        ; nhánh if: EAX = a
    RET
```

Đúng như mô tả ở trên, một `CMP` đi kèm `JG` để nhảy qua nhánh `else` khi điều kiện `if` đúng, còn nhánh `else` nằm ngay liền sau, không cần thêm `JMP` vì nó vốn đã là đoạn mã tiếp theo trong luồng thực thi.

Ví dụ cho vòng lặp for, với một hàm cộng dồn các số từ 0 đến n trừ 1:

```c
int sum_to_n(int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += i;
    }
    return total;
}
```

```nasm
sum_to_n:
    XOR     EAX, EAX        ; total bằng không, EAX sẽ là giá trị trả về
    XOR     EDX, EDX        ; i bằng không, dùng EDX làm biến đếm vòng lặp, ECX vẫn giữ nguyên giá trị n
loop_start:
    CMP     EDX, ECX        ; so sánh i (EDX) với n (ECX, tham số đầu vào, không bị ghi đè)
    JGE     loop_end        ; nếu i lớn hơn hoặc bằng n theo kiểu có dấu, thoát vòng lặp
    ADD     EAX, EDX        ; total cộng thêm i
    INC     EDX             ; i tăng lên một
    JMP     loop_start      ; quay lại đầu vòng lặp
loop_end:
    RET
```

Dấu hiệu nhận diện vòng lặp rõ nhất chính là lệnh `JMP loop_start` ở cuối, nhảy tới một địa chỉ nhỏ hơn địa chỉ hiện tại, còn `JGE loop_end` đóng vai trò điều kiện dừng, được kiểm tra ngay đầu mỗi vòng lặp trước khi thân vòng lặp chạy.

Cấu trúc `switch` với nhiều `case` thì thú vị hơn: khi số lượng `case` đủ lớn và các giá trị `case` gần nhau, trình biên dịch thường không sinh ra một chuỗi so sánh tuần tự từng `case`, mà sinh ra một bảng nhảy gọi là `jump table`, tức một mảng chứa sẵn các địa chỉ, rồi tính chỉ số vào mảng đó dựa trên giá trị biến `switch`, và thực hiện một lệnh `JMP` gián tiếp thông qua mảng đó. Nếu thấy một lệnh `JMP` mà toán hạng không phải một nhãn cố định mà là một biểu thức địa chỉ hóa kiểu bảng cộng chỉ số nhân tám, đây gần như chắc chắn là dấu vết của một `switch` đã được trình biên dịch tối ưu thành `jump table`.

Ví dụ minh họa cơ chế jump table, với một hàm ánh xạ mã số ngày trong tuần sang số giờ làm việc:

```c
int hours_for_day(int day) {
    switch (day) {
        case 0: return 0;
        case 1: return 8;
        case 2: return 8;
        case 3: return 8;
        case 4: return 6;
        default: return -1;
    }
}
```

```nasm
hours_for_day:
    CMP     ECX, 4                      ; kiểm tra day có nằm trong khoảng 0 đến 4 hay không
    JA      default_case                ; nếu day lớn hơn 4, xét như không dấu, ra nhánh mặc định
    LEA     R8, [jump_table]            ; R8 nhận địa chỉ của bảng nhảy
    MOV     EAX, DWORD PTR [R8+RCX*4]   ; lấy offset tương ứng với vị trí thứ day trong bảng
    ADD     RAX, R8                     ; cộng lại thành địa chỉ tuyệt đối
    JMP     RAX                         ; nhảy gián tiếp tới đúng nhãn case
case_0:
    MOV     EAX, 0
    RET
case_1_2_3:
    MOV     EAX, 8
    RET
case_4:
    MOV     EAX, 6
    RET
default_case:
    MOV     EAX, -1
    RET
jump_table:
    ; mảng chứa offset tương đối tới từng nhãn case, lần lượt ứng với day = 0, 1, 2, 3, 4
```

---

Đây là bản minh họa đơn giản hóa cơ chế, không phải bản sao y hệt output thật của `MSVC`, vì trình biên dịch thật còn xử lý thêm bước `zero-extend` chỉ số và địa chỉ hóa `RIP-relative` cho bảng, nhưng ý tưởng cốt lõi giống hệt. Điểm mấu chốt để nhận ra mẫu hình này: một lệnh `CMP` kèm `JA` để loại các giá trị ngoài phạm vi `case` trước tiên, đây cũng là một ví dụ khác của so sánh không dấu đã nói ở [Phần 5](#phần-5-cờ-trạng-thái-rflags-và-nhảy-có-điều-kiện) vì chỉ số `case` luôn được coi là không dấu, sau đó một lệnh `JMP` với toán hạng là một địa chỉ tính từ bảng chứ không phải một nhãn cố định viết sẵn.

Hàm đệ quy hoặc hàm gọi hàm lồng nhau thì dễ nhận ra qua lệnh `CALL` trỏ về chính địa chỉ của hàm đang đọc, đối với đệ quy trực tiếp, hoặc qua nhiều lệnh `CALL` liên tiếp, mỗi lệnh đi kèm một vùng `shadow space` riêng được cấp phát trước đó, cho thấy các lớp gọi hàm lồng vào nhau.

Công cụ thực hành hiệu quả nhất cho phần này là thử viết một đoạn C đơn giản có `if/else`, có vòng lặp `for`, có `switch case`, rồi dùng một trình biên dịch trực tuyến để xem ngay `ASM` tương ứng do `MSVC` sinh ra, sau đó đối chiếu với các mẫu hình vừa nêu ở trên. Cách học bằng tự tay đối chiếu như vậy hiệu quả hơn nhiều so với chỉ đọc lý thuyết suông.

## Phần 8: Đặc thù Windows cần biết sớm

Vì đang học reverse engineering cụ thể trên Windows, có ba đặc thù nên biết ngay từ đầu để không bị bất ngờ khi gặp trong thực tế.

Thứ nhất là việc truy cập `TEB` và `PEB` qua thanh ghi `GS` đã nhắc ở [Phần 2](#phần-2-thanh-ghi-và-vì-sao-một-thanh-ghi-lại-có-nhiều-lớp): biểu thức `GS:[0x60]` thường dẫn tới `PEB`, tức Process Environment Block, của tiến trình hiện tại, và đây là lý do rất nhiều shellcode hoặc loader tự viết đều có một đoạn mã mở đầu bằng cách đọc `GS` ở một offset cố định nào đó.

Thứ hai là cơ chế xử lý ngoại lệ có cấu trúc, tức `SEH`, viết tắt của Structured Exception Handling, được cài đặt theo hai cách hoàn toàn khác nhau giữa x86 32-bit và x64. Trên x86 32-bit, `SEH` được cài đặt bằng một danh sách liên kết nằm ngay trên ngăn xếp, mỗi stack frame tự thêm một mắt xích vào danh sách đó khi hàm bắt đầu chạy. Trên x64, cách này bị bỏ hoàn toàn, thay vào đó là cơ chế dựa trên bảng, gọi là `table-based exception handling`: thông tin cần thiết để gỡ ngăn xếp khi có ngoại lệ xảy ra được lưu sẵn trong hai vùng dữ liệu riêng của tệp PE gọi là `.pdata` và `.xdata`, không nằm trực tiếp trong luồng lệnh chính đang đọc. Lý do của sự thay đổi này liên quan trực tiếp tới quy ước gọi hàm đã nói ở [Phần 6](#phần-6-stack-frame-và-windows-x64-calling-convention): vì `Windows x64 ABI` yêu cầu bắt buộc phải có thông tin unwind cho mọi hàm có điều chỉnh ngăn xếp hoặc dùng thanh ghi non-volatile, việc lưu sẵn thông tin này thành bảng tra cứu riêng đáng tin cậy và nhanh hơn nhiều so với việc dùng một danh sách động trên ngăn xếp vốn có thể bị hỏng nếu ngăn xếp bị ghi đè. Điểm thực tế rút ra là nếu đang tìm trình xử lý ngoại lệ trong một hàm cụ thể trên x64, đừng tìm nó như một đoạn mã nằm xen giữa luồng lệnh chính như trên x86 32-bit, mà phải tìm trong các vùng dữ liệu riêng của tệp PE.

Thứ ba, `ntdll.dll` đóng vai trò tầng thấp nhất vẫn còn là mã người dùng, tức user-mode, trước khi chuyển sang chế độ kernel. Hầu hết hàm trong `kernel32`, `user32`, và các thư viện Win32 API khác, về cuối cùng đều gọi xuống một hàm tương ứng trong `ntdll` trước khi thực hiện lệnh `syscall` để chuyển quyền điều khiển sang kernel. Đây chính là lý do khi gỡ lỗi hoặc đọc stack trace, rất hay thấy tên hàm dạng `ntdll` chấm một cái gì đó ở gần sát đáy nhất của ngăn gọi hàm, đó thường là điểm cuối cùng còn nằm trong phạm vi user-mode trước khi bước sang một thế giới hoàn toàn khác về mặt kiến trúc.

```text
                      USER-MODE                      

┌───────────────────────────────────────────────────┐
│ App (.exe)                                        │
│    │                                              │
│    ▼                                              │
│ kernel32.dll / user32.dll / ...                   │
│    │                                              │
│    ▼                                              │
│ ntdll.dll                                         │
│    │                                              │
│    ├── GS:[0x60] → PEB (dò PEB nếu cần)           │
│    │                                              │
│    ▼  syscall                                     │
└─────┬─────────────────────────────────────────────┘
      │                                              
──────┼─────────────────────────────────────────────┤
      │                 KERNEL-MODE                  
┌─────┼─────────────────────────────────────────────┐
│     ▼                                             │
│ ntoskrnl.exe (kernel)                             │
│     │                                             │
│     ▼                                             │
│ Xử lý syscall → trả kết quả về user-mode          │
└───────────────────────────────────────────────────┘
```

Chương OS-specific trong cuốn *Reverse Engineering for Beginners* của Dennis Yurichev, tìm tại [beginners.re](https://beginners.re), bàn sâu hơn về đúng ba điểm vừa nêu, áp dụng trực tiếp cho Windows.

## Phần 9: Lộ trình thực hành đề xuất

Kiến thức lý thuyết trên chỉ thực sự trở thành kỹ năng nếu được kiểm chứng bằng tay, không phải bằng cách đọc lại nhiều lần.

| Giai đoạn | Nội dung | Cách luyện tập |
|---|---|---|
| 1 | Phần 2, 3: thanh ghi, addressing mode, ngăn xếp | Tự viết vài hàm C đơn giản, biên dịch bằng `MSVC`, đọc disassembly bằng `x64dbg`, chỉ tập trung nhận diện thanh ghi và addressing mode |
| 2 | Phần 4, 5: tập lệnh và cờ trạng thái | Viết hàm có `if/else` đơn giản, tự dự đoán trước cờ, rồi kiểm tra lại bằng `x64dbg` qua panel flags |
| 3 | Phần 6: calling convention | Viết hàm có năm tham số để thấy cả truyền qua thanh ghi lẫn qua ngăn xếp, quan sát kỹ `shadow space` và đoạn prolog, epilog |
| 4 | Phần 7: nhận diện mẫu hình | Dùng trình biên dịch trực tuyến, thử vòng lặp `for`, `switch case`, đệ quy, đối chiếu với các mẫu hình đã nêu |
| 5 | Phần 8 và thực chiến | Bắt đầu đọc mã thật, ví dụ ntdll hoặc một binary nhỏ tự chọn, với đầy đủ nền tảng đã có, tra cứu [felixcloutier.com/x86](https://felixcloutier.com/x86) mỗi khi gặp lệnh lạ |

## Tài liệu tham khảo

Không cần quá nhiều nguồn, chỉ cần vài nguồn thực sự cần thiết. *Intel 64 and IA-32 Architectures Software Developer's Manual*, tải chính thức tại [intel.com](https://intel.com), là nguồn chính xác tuyệt đối khi cần tra cứu sâu, nhưng vì bộ tài liệu này rất dày nên không nên đọc tuần tự mà chỉ dùng để tra cứu khi cần. Trang [felixcloutier.com/x86](https://felixcloutier.com/x86) là bản tổng hợp lại chính nội dung của Intel SDM nhưng tra cứu nhanh hơn nhiều, mỗi lệnh có một trang riêng mô tả chính xác hoạt động của nó, và đây sẽ là trang mở ra tra cứu thường xuyên nhất trong suốt quá trình học. Về quy ước gọi hàm riêng của Windows, trang chính thức của Microsoft tại [learn.microsoft.com](https://learn.microsoft.com) với từ khóa `x64 calling convention` trình bày đầy đủ và chính xác nhất. Cuốn sách miễn phí *Reverse Engineering for Beginners* của Dennis Yurichev, tìm tại [beginners.re](https://beginners.re), là một nguồn rất đầy đủ, có cả một chương riêng về đặc thù hệ điều hành áp dụng trực tiếp cho những gì đã nêu ở [Phần 8](#phần-8-đặc-thù-windows-cần-biết-sớm). Cuối cùng, một trình biên dịch trực tuyến như Compiler Explorer tại [godbolt.org](https://godbolt.org) là công cụ thực hành giá trị nhất cho [Phần 7](#phần-7-nhận-diện-mẫu-hình-trong-mã-do-trình-biên-dịch-sinh-ra), cho phép xem ngay ASM được sinh ra khi gõ mã C, thay vì phải tưởng tượng suông.
