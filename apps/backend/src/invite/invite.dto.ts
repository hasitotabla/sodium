import { IsString, MinLength } from 'class-validator';

export class InviteCreateDTO {
  @IsString()
  code: string;
}
