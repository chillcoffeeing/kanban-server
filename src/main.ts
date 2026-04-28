import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Logger } from "nestjs-pino";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { TypedConfigService } from "./config/typed-config.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const config = app.get(TypedConfigService);

  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(helmet());
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : config.get("CORS_ORIGINS") || [];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const globalPrefix = process.env.API_PREFIX || config.get("API_PREFIX");
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle("Kanban Platform API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swagger));

  await app.listen(Number(process.env.PORT) || config.get("PORT"), "0.0.0.0");
}

void bootstrap();
