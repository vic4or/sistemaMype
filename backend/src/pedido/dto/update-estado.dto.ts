import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEstadoPedidoDto {
  @IsNotEmpty()
  @IsString()
  estado_pedido: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'ANULADO';
}
