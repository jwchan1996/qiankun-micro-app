<h1 align="center">micro-frontend-demo</h1>
<p align="center">🌈 微前端部署</p>

## 编译

各自编译主应用与子应用

## 部署

根据子应用在主应用的注册入口地址配置 nginx

配置端口地址匹配目录与域名
```bash
http {
    include       mime.types;
	#include luawaf.conf;

	include proxy.conf;

    default_type  application/octet-stream;
    
    ...
    ...
    ...
    
    server {
    	listen	80;
        server_name main.ppap.live;
        
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
    	
        location / {
        	root /www/server/nginx/html/main;
            index index.html;
        }
    }
    
    server {
    	listen	80;
        server_name one.ppap.live;
        
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        
        location / {
            valid_referers server_names
                       main.ppap.live;
            if ( $invalid_referer ) {
            	rewrite ^(.*)  http://main.ppap.live$1 redirect;
            }
            
        	root /app/one;
            index index.html;
        }
    }
    
    server {
    	listen	80;
        server_name two.ppap.live;
        
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        
        location / {
        	valid_referers server_names
                       main.ppap.live;
            if ( $invalid_referer ) {
            	rewrite ^(.*)  http://main.ppap.live$1 redirect;
            }
            
        	root /app/two;
            index index.html;
        }
    }
    
}
```

将主应用与子应用编译文件放到对应的服务器目录地址