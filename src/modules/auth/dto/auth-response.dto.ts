import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty() accessTokenExpiresIn!: string;
  @ApiProperty() refreshTokenExpiresIn!: string;
  @ApiProperty({ type: UserResponseDto }) user!: UserResponseDto;
}
