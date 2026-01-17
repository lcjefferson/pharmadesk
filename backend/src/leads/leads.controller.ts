import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createLeadDto: CreateLeadDto,
    @Request()
    req: { user: { companyId: string | null; role: UserRole } },
  ) {
    return this.leadsService.create(createLeadDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Request()
    req: {
      user: { companyId: string | null; role: UserRole };
    },
  ) {
    return this.leadsService.findAll(req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.leadsService.findOne(id, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.leadsService.update(id, updateLeadDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.leadsService.assign(id, userId, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.leadsService.remove(id, req.user.companyId);
  }
}
