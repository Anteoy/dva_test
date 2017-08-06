FROM hub.c.163.com/library/nginx:1.10.3
ADD dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/conf.d/default.conf