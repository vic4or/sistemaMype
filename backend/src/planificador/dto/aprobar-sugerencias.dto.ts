import { IsArray, IsNumber } from 'class-validator';

export class AprobarSugerenciasDto {
  @IsArray()
  @IsNumber({}, { each: true })
  sugerencia_ids: number[];
}