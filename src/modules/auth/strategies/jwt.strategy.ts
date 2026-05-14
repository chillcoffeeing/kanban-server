import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TypedConfigService } from "@config/typed-config.service";
import type { AccessTokenPayload } from "../interfaces/token-payload.interface";
import type { AuthUser } from "../interfaces/auth-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: TypedConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_SECRET || config.get("JWT_ACCESS_SECRET"),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
