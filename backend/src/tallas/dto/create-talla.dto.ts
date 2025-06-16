import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateTallaDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  valor_talla?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_creacion?: string;
}