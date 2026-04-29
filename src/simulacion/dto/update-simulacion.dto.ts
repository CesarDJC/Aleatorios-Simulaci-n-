import { PartialType } from '@nestjs/mapped-types';
import { CreateSimulacionDto } from './create-simulacion.dto';

export class UpdateSimulacionDto extends PartialType(CreateSimulacionDto) {}
