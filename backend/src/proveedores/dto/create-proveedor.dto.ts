import { IsOptional, IsString, IsEmail, IsBoolean, IsInt } from 'class-validator'

export class CreateProveedorDto {
  @IsOptional()
  @IsString()
  razon_social?: string

  @IsOptional()
  @IsString()
  ruc?: string

  @IsOptional()
  @IsString()
  direccion?: string

  @IsOptional()
  @IsString()
  telefono?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  usuario_creacion?: string

  @IsOptional()
  @IsInt()
  lead_time_dias?: number;
}