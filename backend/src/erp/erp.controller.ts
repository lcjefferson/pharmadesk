import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ErpService } from './erp.service';
import { CreateErpDto } from './dto/create-erp.dto';
import { UpdateErpDto } from './dto/update-erp.dto';

@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  @Post()
  create(@Body() createErpDto: CreateErpDto) {
    return this.erpService.create(createErpDto);
  }

  @Get()
  findAll() {
    return this.erpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.erpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateErpDto: UpdateErpDto) {
    return this.erpService.update(+id, updateErpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.erpService.remove(+id);
  }
}
