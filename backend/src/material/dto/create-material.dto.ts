import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateMaterialDto {
  @IsNotEmpty()
  @IsString()
  codigo_material: string;

  @IsOptional()
  @IsString()
  descripcion_material?: string;

  @IsNotEmpty()
  @IsNumber()
  categoria_material_id: number;

  @IsOptional()
  @IsNumber()
  color_id?: number;

  @IsOptional()
  @IsNumber()
  talla_id?: number;

  @IsOptional()
  @IsNumber()
  unidad_medida_id?: number;

  @IsOptional()
  @IsNumber()
  unidad_consumo_id?: number;

  @IsOptional()
  @IsNumber()
  factor_conversion_compra?: number;

  @IsOptional()
  @IsNumber()
  rendimiento_tela?: number;

  @IsOptional()
  @IsString()
  tipo_tejido_tela?: string;
}