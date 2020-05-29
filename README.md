# Raspbanky

Raspbanky is a small NestJS server that queries Ibanity's Ponto API to retrieve bank account balances.

## Flow

1. Browse to (https://localhost:3000/ibanity/authorize)[https://localhost:3000/ibanity/authorize]
2. You are redirected to Ponto's authorization flow
3. Once you gave consent and chose which account you want to share, you are redirected to (https://localhost:3000/ibanity/callback)[https://localhost:3000/ibanity/callback]. This URL needs to be added to your Ponto authorized redirect URIs
4. A first access token will be requested (together with a refresh token) and stored in the sqlite database.
5. At every request to the API, the validity of the last access token is checked (TTL of 30 minutes) and if needed a new one will be requested with the refresh token. The new access token and refresh token will replace the old ones in the sqlite database.
6. HTTP requests to (https://localhost:3000/ibanity/accounts)[https://localhost:3000/ibanity/accounts] will trigger a POST request to URL_POST_BALANCE with the account balance in the body of the request.

## Environment variables

```
URL_POST_BALANCE=http://192.168.1.ZZZ:XXXX # The URL to wich the account balance should be sent (with port number)
PONTO_CLIENT_ID=client-id
PONTO_CLIENT_SECRET=client-secret
PONTO_CERT_PASSPHRASE=my-passphrase-for-my-certificate
```

## Database

A small sqlite database is used to persist state during the authorization flow with Ponto and store `access_token`s and `refresh_token`s. The database file (`database.db`) is placed at the root of the application.

## Secrets

### Localhost certificate and private key

Ponto requires the production call back to be HTTPS. Therefore, if you want to run it locally, you need to generate a certificate to serve in HTTPS.

1. Create a certificate and private key

```
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

2. Move the create files (localhost.crt and localhost.key in the `secrets` folder)
3. Install `localhost.crt` in your list of locally trusted roots
   - In Chrome, go to [Settings](chrome://settings)
   - In the Privacy and security menu, click on more in the Privacy and security section
   - Click on Manage certificates and Import the generate certificate

### Ponto mutual TLS certificate

Ponto requires a mutual TLS authentication which requires that you need to attach TLS certificates when making requests to their API.
Place the downloaded certificates in the secrets folder (`certificate.pem` and `private_key.pem`). Don't forget to specify the passphrase in the env variables.
