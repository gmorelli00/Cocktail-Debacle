FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ../backend/wwwroot /app/wwwroot

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]