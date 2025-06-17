import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreatePedidoDto } from './create-pedido.dto';

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    usuario_modificacion?: string;
}