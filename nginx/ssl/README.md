# SSL Certificate Placeholder

This directory should contain your SSL/TLS certificates for HTTPS.

## For Development (Self-Signed)

Generate self-signed certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## For Production (Let's Encrypt)

Use certbot to generate certificates:

```bash
certbot certonly --standalone -d your-domain.com
```

Then copy the certificates here:
- `cert.pem` - Full certificate chain
- `key.pem` - Private key

## Security Notes

- Never commit actual certificates to version control
- Keep private keys secure
- Renew certificates before expiration
- Use strong key sizes (2048+ bits for RSA)

## Files

Place your certificate files here:
- `cert.pem` - Certificate file
- `key.pem` - Private key file

These files are gitignored for security.
