import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator'

export class CreateClienteDto {
  @IsOptional()
  @IsString()
  nombre?: string

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
}