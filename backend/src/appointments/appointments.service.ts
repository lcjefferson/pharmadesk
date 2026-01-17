import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  create(createAppointmentDto: CreateAppointmentDto, companyId: string | null) {
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      companyId: companyId ?? null,
    });
    return this.appointmentRepository.save(appointment);
  }

  findAll(companyId: string | null) {
    return this.appointmentRepository.find({
      where: companyId ? { companyId } : {},
      relations: ['client'],
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string | null) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id,
        ...(companyId ? { companyId } : {}),
      },
      relations: ['client'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment #${id} not found`);
    }
    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    companyId: string | null,
  ) {
    const appointment = await this.findOne(id, companyId);
    this.appointmentRepository.merge(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, companyId: string | null) {
    const appointment = await this.findOne(id, companyId);
    return this.appointmentRepository.remove(appointment);
  }
}
