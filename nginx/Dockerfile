FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./backend/wwwroot /app/wwwroot

CMD ["nginx", "-g", "daemon off;"]