import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { FileSortBy } from '../../../shared/src/types/File';

export class FileUploadDTO {
  @IsString()
  @IsOptional()
  password: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  delete_timestamp: number;
}

export class FileSearchParamsDTO {
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

  @IsString()
  sortBy: FileSortBy;
}
