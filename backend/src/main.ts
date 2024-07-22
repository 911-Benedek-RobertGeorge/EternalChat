import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Ethernal Chat Api')
    .setDescription('The API for EthernalChat service')
    .setVersion('1.0')
    .addTag('EthernalChat')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const allowedOrigins = [
    'https://eternal-chat.vercel.app', // Production URL
    'http://localhost:3001',           // Local development URL
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error(err); // eslint-disable-line no-console
  process.exit(1);
});
