import { PartialType } from '@nestjs/swagger';
import { CreateErpDto } from './create-erp.dto';

export class UpdateErpDto extends PartialType(CreateErpDto) {}
