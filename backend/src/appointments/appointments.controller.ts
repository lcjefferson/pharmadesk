import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.appointmentsService.create(
      createAppointmentDto,
      req.user.companyId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req: { user: { companyId: string | null } }) {
    return this.appointmentsService.findAll(req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.appointmentsService.findOne(id, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.appointmentsService.update(
      id,
      updateAppointmentDto,
      req.user.companyId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.appointmentsService.remove(id, req.user.companyId);
  }
}
