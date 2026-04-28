import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { TypedConfigService } from "@config/typed-config.service";

@Injectable()
export class PasswordHasherService {
  private readonly rounds: number;

  constructor(config: TypedConfigService) {
    this.rounds = process.env.BCRYPT_ROUNDS
      ? parseInt(process.env.BCRYPT_ROUNDS)
      : config.get("BCRYPT_ROUNDS");
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
