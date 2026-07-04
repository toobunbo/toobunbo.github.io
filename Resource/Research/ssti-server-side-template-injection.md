---
title: "SSTI - Server Side Template Injection"
description: "Phân tích và khai thác lỗ hổng Server Side Template Injection"
author: "LamChanKhai"
date: "2026-07-04"
categoryEn: "WEB"
categoryJp: "アクション"
difficulty: "mid"
tags: ["Web", "SSTI", "Template Injection"]
hot: false
cover: "../uploads/Khai_thumb.png"
---

# SSTI-Server-Side-Template-Injection
## SSTI là gì?
Để hiểu được SSTI là gì, chúng ta cần biết ```template``` là gì? Mình sẽ giải thích qua một ví dụ:

Hãy giả sử bạn ứng tuyển vào một công ty và công ty đó có sẵn hàng loạt mẫu đơn tuyển dụng, ứng viên chỉ cần lấy và điền thông tin vào đơn. 

<p align="center">
  <img src="../uploads/ssti-images/donmau" width="700">
</p>
Template giống như tờ đơn in sẵn: có khung, tiêu đề, chỗ điền; phần cố định do người soạn in sẵn, phần biến đổi là chỗ người dùng điền.

Trên web, **template** có thể là mã HTML, có các tiêu đề (mình sẽ gọi cái này là các yếu tố cố định trên template) và có ```placeholder``` (ví dụ bên dưới) để sau đó hệ thống điền dữ liệu để thay thế các placeholder này. 

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ví dụ Template</title>
</head>
<body>
  <h1>Xin chào {{ name }}</h1>
  <p>Email của bạn là: {{ email }}</p>
  <p>Vị trí ứng tuyển: {{ position }}</p>
</body>
</html>
```

Để hệ thống thay các placeholder trong template bằng dữ liệu thì cần có một thứ gọi là **Engine**. **Engine** này đóng vai trò tổng hợp các yếu tố cố định trên template với các dữ liệu được đưa vào tại thời điểm đó để render ra phiên bản web page tương ứng. Ở ngoài kia có rất nhiều **Template Engine** tùy thuộc vào ngôn ngữ mà web sử dụng ví dụ như ``` Jinja2 (Python), Twig (PHP), Velocity (Java) ```.

### Vậy SSTI là gì? 
Như cái tên của nó, đây là một lỗi ```Injection```, chúng ta sẽ tiêm payload độc hại và nó sẽ được xữ lý ở phía server và sau khi engine render template có thể sinh ra những kết quả không mong muốn. Trong đa số trường hợp xảy ra lỗ hổng **SSTI** đều mang lại các hậu quả to lớn cho server, bởi các payload SSTI được thực thi trực tiếp tại server và thường dẫn tới tấn công thực thi mã nguồn tùy ý từ xa ```(RCE - Remote Code Execution)```.

## Cụ thể **Server-Side Template Injection – SSTI** diễn ra như thế nào?
Như đã nói ở trên, **engine** sẽ lấy các dữ liệu liên quan điền vào ```placeholder``` rồi render ra web page tương ứng, nếu như các dữ liệu được dùng không phải do trực tiếp truyền vào thì việc khai thác **SSTI** là không thể. Như mã này:

```python
@app.route('/')
def hello_world():
   user = {'name':'Khai','email':'khai@gmail.com','position':'Intern'} # Xem đây là dữ liệu từ database
   name = user.get('name')
   email = user.get('email')
   position = user.get('position')
   template='''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ví dụ Template</title>
</head>
<body>
  <h1>Xin chào '''+name+''' </h1>
  <p>Email của bạn là: '''+email+'''</p>
  <p>Vị trí ứng tuyển: '''+position+'''</p>
</body>
</html>''' 
   return render_template_string(template)
```

<p align="left">
  <img src="../uploads/ssti-images/image.png" width="700">
</p>

Trong ví dụ này khi người dùng truy cập vào trang chủ, ứng dụng sẽ thực thi hàm ```hello_world()```. Vì dữ liệu được điền vào được lấy từ ```Database``` nên người khai thác không thể trực tiếp tiêm payload độc hại được, dẫn đến không thể khai thác ```SSTI``` _(Ứng dụng có validate khi thêm mới một user vào Database :)) )_.

Nhưng nếu lập trình viên dùng dữ liệu từ người dùng để tăng tính linh hoạt và tương tác của ứng dụng như lại quên ```validate``` dữ liệu được nhận thì nó lại là câu chuyện khác.

```python
@app.route('/')
def hello_world():
   name = request.args.get('name')
   email = request.args.get('email')
   position = request.args.get('position')
   if not email:
      email = "trống"
   if not position:
      position = "trống"
   template='''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ví dụ Template</title>
</head>
<body>
  <h1>Xin chào '''+name+''' </h1>
  <p>Email của bạn là: '''+email+'''</p>
  <p>Vị trí ứng tuyển: '''+position+'''</p>
</body>
</html>''' 
   return render_template_string(template)
```

Trong trường hợp này dữ liệu được lấy từ các tham số qua Method **GET** do người dùng truyền vào.

<p align="left">
  <img src="../uploads/ssti-images/image2" width="700">
</p>

Xem qua code, ta thấy không có bất kì hàm nào dùng để ```validate``` cả 3 dữ liệu do người dùng truyền vào. Hãy thử một payload khác để kiểm tra.
<p align="left">
  <img src="../uploads/ssti-images/img3" width="700">
</p>

Thay vì in ra dữ liệu mà kẻ tấn công truyền vào, ứng dụng lại in ra 49, điều đó chứng tỏ ứng dụng có thể bị khai thác ```SSTI```. Bây giờ chỉ cần thay đổi payload là kẻ tấn công đã có thể __RCE__ rồi.

## Nhưng mà tại sao lại như vậy?

<p align="left">
  <img src="../uploads/ssti-images/img4.jpg" width="400">
</p>

Nguyên nhân thay vì in ra {{7*7}} thay vì 49 là do trong source code, ta có thể thấy tham số được nối chuỗi trực tiếp vào template.

```python
<h1>Xin chào '''+name+''' </h1>
```
Nếu name chứa __cú pháp template__ (ví dụ ```{{ ... }}``` hoặc ```{% ... %}```), thì sau khi ghép vào, chuỗi template trở thành một template do người dùng kiểm soát và Jinja2 sẽ cố gắng __thực thi biểu thức/template logic đó → đây chính là điều tạo ra SSTI.__

## Cách ngăn chặn

Vì **SSTI** cũng là một loại lỗ hổng về ``injection``, nên để ngăn chặn nó ta cần **validate** được gửi từ người dùng. Có thể dùng filter ~~đơn giản~~ để lọc ra cái kí tự không nên xuất hiện.

```python
name = request.args.get('name')
   email = request.args.get('email')
   position = request.args.get('position')
   if not name:
      name = "trống"
   if not email:
      email = "trống"
   if not position:
      position = "trống"
   simple_filter=["flag", "*", "\"", "'", "\\", "/", ";", ":", "~", "`", "+", "=", "&", "^", "%", "$", "#", "@", "!", "\n", "x", "import", "os", "request", "attr", "sys", "builtins", "class", "subclass", "config", "json", "sessions", "self", "templat", "view", "wrapper", "test", "log", "help", "cli", "blueprints", "signals", "typing", "ctx", "mro", "base", "url", "cycler", "get", "join", "name", "g.", "lipsum", "application", "render"]
   for char_num in range(len(simple_filter)):
      if simple_filter[char_num] in name.lower() or simple_filter[char_num] in email.lower() or simple_filter[char_num] in position.lower():
         name = "trống"
         email = "trống"
         position = "trống"
         break
```

<p align="left">
  <img src="../uploads/ssti-images/img5" width="700">
</p>


hoặc thay vì nối chuỗi, source code có thể viết như vậy:

```python

<body>
  <h1>Xin chào {{name}} </h1>
  <p>Email của bạn là: {{email}}</p>
  <p>Vị trí ứng tuyển: {{position}}</p>
</body>
</html>''' 
   return render_template_string(template, name=name, email=email, position=position)
```

Khi đó Jinja sẽ escape tham số nhận được, làm cho **atacker** không thể chèn được __cú pháp template__

<p align="left">
  <img src="../uploads/ssti-images/img6" width="700">
</p>

## Kết 
OK, tổng kết lại nội dung bài này:
- Khái niệm template và SSTI.
- Điều kiện để có thể khai thác được SSTI (**template nối chuỗi với untrusted data**).
- Cách ngăn chặn.

Hy vọng sẽ sớm có phần 2 các bước triển khai SSTI attack. ~~hoặc là không~~




### Phần 2: Triển khai tấn công SSTI
Nối tiếp phần 1, bài này sẽ tiếp tục với ```SSTI```
## Các bước triển khai tấn công SSTI.
Dựa vào ```portswigger```, mình sẽ chia phần này thành 3 giai đoạn, __detect__(_Phát hiện_), __identify__(_Xác định_) và __exploit__(_Khai thác_).
<p align="center">
  <img src="https://dummytip.com/wp-content/uploads/2022/08/1-SSTI-attack-steps.png" width="300"> 
</p>

# Detect

<p align="left">
  <img src="../uploads/ssti-images/iknow-whatkind.gif" width="150"> 
</p>

~~"_Tôi biết trang web đang bị __SSTI__ nhưng không thể chứng minh_"~~

Như bất kì lỗ hỏng nào khác, để khai thác được ```SSTI``` ta cần phát hiện ra nó. Phương pháp được dùng nhiều là ```fuzzing```. Với các dữ liệu từ người dùng như:
- Các trường trong __header__ của request( ví dụ: ```User-Agent```, ```Referer```,...).
- Tham số từ ```url request```( /?thamso1= ,...).
- Các trường dữ liệu được gửi qua form.
  
Ta thử thêm chuỗi các ký tự đặc biệt thường được sử dụng trong các biểu thức __template__, chẳng hạn như ```$ {{<%[%'"}}%```. Nếu xảy ra ```exception```, điều này cho thấy cú pháp __template__ được chèn vào đã được server diễn giải. Đây là một dấu hiệu cho thấy ```SSTI``` có thể tồn tại.

Nếu bạn đang làm 1 bài CTF whitebox thì mọi chuyện sẽ đơn giản hơn, khi đọc source code nếu phát hiện ```untrusted data``` được nối chuỗi trực tiếp vào __template__ thì đó chính xác là nơi mà chúng ta sẽ khai thác.

# Identify

Sau  khi xác định được web dính ```SSTI```, vẫn còn 1 bước cần làm trước khi khai thác là xác định xem trang web đang dùng ```template engine``` nào. Với các ngôn ngữ khác nhau lại có ```template engine``` khác nhau nên số lượng ```template engine``` khá lớn, và mỗi ```template engine``` lại có __syntax__ khác nhau nên ta cần xác định đúng ```template engine```, nhưng nhìn chung tụi nó lại khá tương đồng về mặt __syntax__.

Nếu may mắn, server được cấu hình debug, ta sẽ nhận được thông báo lỗi khi gửi payload ở bước ```detect``` và từ đó xác định được ngôn ngữ hay thậm chí là ```engine```. Ví dụ: 

<p align="center">
  <img src="../uploads/ssti-images/1_RCmIxcuG3_olj_sUUiRukw.webp" width="700"> 
</p>

Qua thông báo lỗi, ta biết được ```engine``` đang được dùng là ```handlebars```.


Nếu không được nhả lỗi, ta có thể xác định ```engine``` bằng cách thủ công gửi thử payload với các syntax của các ```engine``` khác nhau, đánh giá phản hồi rồi loại trừ từng ```engine```.


<p align="center">
  <img src="../uploads/ssti-images/Flow-Chart-showing-all-the-template-engine-detection-payloads.png.webp" width="400"> 
</p>

[___Nguồn ảnh ở đây___](https://www.varutra.com/server-side-template-injection-vulnerability-exploitation/)

<p align="center">
  <img src="../uploads/ssti-images/image (9).png" width="500"> 
</p>

[___Nguồn ảnh ở đây___](https://book.hacktricks.wiki/en/pentesting-web/ssti-server-side-template-injection/index.html)

Ngoài cách thủ công ra, ta có thể xác định được engine bằng các tools như ```SSTImap```, ```TInjA``` [___Xem thêm ở đây___](https://book.hacktricks.wiki/en/pentesting-web/ssti-server-side-template-injection/index.html)


