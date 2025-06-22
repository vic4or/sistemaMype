import { PartialType } from '@nestjs/mapped-types';
import { CreateTizadoTallaDto } from './create-tizado-talla.dto';

export class UpdateTizadoTallaDto extends PartialType(CreateTizadoTallaDto) {}