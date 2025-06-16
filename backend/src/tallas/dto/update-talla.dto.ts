import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateTallaDto } from './create-talla.dto';

export class UpdateTallaDto extends PartialType(CreateTallaDto) {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    usuario_modificacion?: string;
}