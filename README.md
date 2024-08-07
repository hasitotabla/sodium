<div align="center"><img src="https://i.imgur.com/q7Z2OTN.png" width="64" style="border-radius: 32px;"/></br><h1>sodium.upload</h1></div>

## 😎 Features

- Share files using a link
- Set password and expiration date for shares
- Possibility to close registrations and make it invite-only
- Upload limit for each user (and possible to set default for new users)
- Uploads are only limited by your disk-space

## 📚 Setup

Before install, make sure you have `docker` and `docker-compose` installed.

```bash
git clone https://github.com/hasitotabla/sodium
cd sodium

cp -r .env.example .env
nano .env
# ... and set the env variables on your needs

sudo docker compose up --build -d
```

✨ And you're done! The website is running on `http://localhost:5173`!

### Setup Nginx reverse proxy

```bash
sudo apt install nginx certbot # if not already installed
sudo systemctl stop nginx

certbot certonly -d upload-api.yourdomain.tld -d upload.yourdomain.tld --standalone
```

<br/>

Edit this nginx config on your preferences, and paste it in `/etc/nginx/sites-available/sodium.conf`

<details>
<summary>
<b>Nginx config</b>
</summary>

```nginxconf
server {
    listen 443 ssl http2;
    server_name <upload-api.yourdomain.tld>;

    # allow larger file uploads and longer script runtimes
    client_max_body_size 100m;
    client_body_timeout 120s;

    sendfile off;

    ssl_certificate /etc/letsencrypt/live/<upload-api.yourdomain.tld>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<upload-api.yourdomain.tld>/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
    ssl_prefer_server_ciphers on;

    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Robots-Tag none;
    add_header Content-Security-Policy "frame-ancestors 'self'";
    add_header X-Frame-Options DENY;
    add_header Referrer-Policy same-origin;

    location / {
        proxy_pass http://localhost:4500;
    }
}

server {
    listen 443 ssl http2;
    server_name <upload.yourdomain.tld>;

    # allow larger file uploads and longer script runtimes
    client_max_body_size 100m;
    client_body_timeout 120s;

    sendfile off;

    ssl_certificate /etc/letsencrypt/live/<upload.yourdomain.tld>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<upload.yourdomain.tld>/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
    ssl_prefer_server_ciphers on;

    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Robots-Tag none;
    add_header Content-Security-Policy "frame-ancestors 'self'";
    add_header X-Frame-Options DENY;
    add_header Referrer-Policy same-origin;

    location / {
        proxy_pass http://localhost:5173;
    }
}
```

</details>

<br/>

And then, just create a symlink to enable the config and start Nginx.

```bash
sudo ln -s /etc/nginx/sites-available/sodium.conf /etc/nginx/sites-enabled/sodium.conf
sudo systemctl start nginx
```

## 🛠️ Upgrade to the latest version

```bash
cd path/to/sodium
sudo docker compose down
git pull
sudo docker compose up --build -d
```
