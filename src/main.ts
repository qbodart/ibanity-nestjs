import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const keyFile = fs.readFileSync(__dirname + '/../secrets/localhost.key');
  const certFile = fs.readFileSync(__dirname + '/../secrets/localhost.crt');
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: keyFile,
      cert: certFile,
    },
  });
  await app.listen(3000);
}
bootstrap();
