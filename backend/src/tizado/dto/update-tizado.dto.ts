import { PartialType } from '@nestjs/mapped-types';
import { CreateTizadoDto } from './create-tizado.dto';

export class UpdateTizadoDto extends PartialType(CreateTizadoDto) {}