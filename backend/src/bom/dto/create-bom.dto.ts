export class CrearBOMComunDto {
  usuario: string;
  items: {
    producto_id: number;
    material_id: number;
    unidad_medida_id: number;
    cantidad_consumo_base: number;
  }[];
}
export class CrearBOMVariacionDto {
  usuario: string;
  items: {
    producto_tal_col_id: number;
    material_id: number;
    unidad_medida_id: number;
    cantidad_consumo_especifica: number;
  }[];
}