export const config = {
  typeOrm: {
    type: 'sqlite',
    database: 'database.db',
    synchronize: true,
    logging: false,
    entities: ['dist/**/*.entity{.ts,.js}'],
  },
  ponto: {
    clientId: process.env.PONTO_CLIENT_ID,
    clientSecret: process.env.PONTO_CLIENT_SECRET,
    redirectUrl: 'https://localhost:3000/ibanity/callback',
    scope: 'ai pi offline_access',
    authorizationUrl: 'https://authorization.myponto.com/oauth2/auth',
    tokenUrl: 'https://api.ibanity.com/ponto-connect/oauth2/token',
    baseApiUrl: 'https://api.ibanity.com/ponto-connect',
    passphraseCertificate: process.env.PONTO_CERT_PASSPHRASE,
  },
};
