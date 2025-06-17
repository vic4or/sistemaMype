import { PartialType } from '@nestjs/mapped-types';
import { CreateCombinacionDto } from './create-combinacion.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCombinacionDto extends PartialType(CreateCombinacionDto) {
  @IsOptional()
  @IsString()
  usuario_modificacion?: string;
}