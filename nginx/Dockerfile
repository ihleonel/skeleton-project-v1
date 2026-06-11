FROM nginx:alpine

# Copiar configuración personalizada
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8888

CMD ["nginx", "-g", "daemon off;"]
