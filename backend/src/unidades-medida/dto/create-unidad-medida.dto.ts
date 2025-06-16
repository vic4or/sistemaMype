import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateUnidadMedidaDto {
    @IsOptional()
    @IsString()
    @MaxLength(30)
    nombre_unidad?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(10)
    abreviatura?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(50)
    usuario_creacion?: string;

  }