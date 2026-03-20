FROM debian:12

# Nginx, PHP, extensions + outils Composer
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
      nginx \
      php8.2 php8.2-fpm php8.2-mysql php8.2-curl php8.2-zip php8.2-mbstring \
      git unzip curl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/www/hhc/ 
RUN rm /etc/nginx/sites-enabled/default

# (Décommente si tu veux copier le code à build-time)
# COPY ./conf/SyntheSantePerso/ /var/www/synthesante/
# COPY ./conf/CV/ /var/www/cv_en_ligne/

# Droits
RUN chown -R www-data:www-data /var/www/hhc && chmod -R 755 /var/www/hhc

COPY ./website/conf/website /etc/nginx/sites-available/website
RUN ln -s /etc/nginx/sites-available/website /etc/nginx/sites-enabled/

# Nettoyages
RUN rm -f /var/www/html/index.nginx-debian.html

EXPOSE 80
CMD service php8.2-fpm start && nginx -g 'daemon off;'



