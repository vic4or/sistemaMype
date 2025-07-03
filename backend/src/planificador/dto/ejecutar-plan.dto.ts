import { IsDateString } from 'class-validator';

export class EjecutarPlanDto {
  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;
}