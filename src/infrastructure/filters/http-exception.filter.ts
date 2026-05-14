import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@/generated/prisma/client";

const PRISMA_STATUS_MAP: Record<string, HttpStatus> = {
  P2002: HttpStatus.CONFLICT,
  P2025: HttpStatus.NOT_FOUND,
  P2014: HttpStatus.BAD_REQUEST,
  P2003: HttpStatus.BAD_REQUEST,
};

const PRISMA_MESSAGE_MAP: Record<string, string> = {
  P2002: "El recurso ya existe",
  P2025: "Recurso no encontrado",
  P2014: "Referencia inválida",
  P2003: "Referencia inválida",
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let code: string | undefined;

    let extraFields: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const body = res as Record<string, unknown>;
        message = (body.message as string) ?? exception.message;
        code = body.code as string | undefined;
        extraFields = { ...body };
        delete extraFields.statusCode;
        delete extraFields.message;
        delete extraFields.error;
      } else {
        message = exception.message;
      }
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError
    ) {
      status = PRISMA_STATUS_MAP[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = PRISMA_MESSAGE_MAP[exception.code] ?? "Error interno del servidor";
      code = `PRISMA_${exception.code}`;
      this.logger.warn(`Prisma error: ${exception.code} — ${exception.message}`);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Error interno del servidor";
      const e = exception as Record<string, unknown> | null;
      this.logger.error("Unhandled exception", e?.message as string ?? "Unknown error", e?.stack as string ?? "");
    }

    const errorBody: Record<string, unknown> = {
      statusCode: status,
      message,
      error: HttpStatus[status] ?? "Unknown",
      ...extraFields,
    };
    if (code) errorBody.code = code;

    response.status(status).json(errorBody);
  }
}
