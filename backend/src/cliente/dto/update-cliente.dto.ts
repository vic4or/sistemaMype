import { PartialType } from '@nestjs/mapped-types'
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateClienteDto } from './create-cliente.dto'

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    usuario_modificacion?: string;
}