import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateColorDto } from './create-color.dto';

export class UpdateColorDto extends PartialType(CreateColorDto) {
    @IsString()
    @IsOptional()
    @MaxLength(50)
    usuario_modificacion?: string;
}