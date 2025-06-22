import { IsNumber, IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTizadoTallaDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  talla_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cantidad?: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_creacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_modificacion?: string;
}