import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateColorDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nombre_color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_color?: string;


  @IsOptional()
  @IsString()
  @MaxLength(50)
  usuario_creacion?: string;

}