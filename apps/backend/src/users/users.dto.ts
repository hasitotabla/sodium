import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UsersSearchQueryDTO {
  @IsString()
  @IsOptional()
  search: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  page: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageSize: number;
}

export class UsersUpdateUploadLimitDTO {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  uploadLimit: number;
}

export class UserDeleteQueryDTO {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId: number;
}
