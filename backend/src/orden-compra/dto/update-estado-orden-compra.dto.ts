import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEstadoOrdenCompraDto {
  @IsNotEmpty()
  @IsString()
  estado_oc: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ENTREGADA' | 'CANCELADA';
}