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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createClientDto: CreateClientDto,
    @Request()
    req: { user: { companyId: string | null; role: UserRole } },
  ) {
    return this.clientsService.create(createClientDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Request()
    req: {
      user: { companyId: string | null; role: UserRole };
    },
  ) {
    return this.clientsService.findAll(req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.clientsService.findOne(id, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.clientsService.update(id, updateClientDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.clientsService.assign(id, userId, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string | null } },
  ) {
    return this.clientsService.remove(id, req.user.companyId);
  }
}
