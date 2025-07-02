import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegistrarMovimientoManualDto {
  @IsDateString()
  fecha_movimiento: string;

  @IsEnum(['Entrada', 'Salida', 'Ajuste'])
  tipo_movimiento: 'Entrada' | 'Salida' | 'Ajuste';

  @IsNotEmpty()
  @IsNumber()
  material_id: number;

  @IsNotEmpty()
  @IsNumber()
  cantidad: number;

  @IsString()
  usuario: string;

  @IsString()
  referencia?: string;

  @IsString()
  observaciones?: string;
}