import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Client } from '../clients/entities/client.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Message } from '../messages/entities/message.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Lead, Message, Appointment, Campaign]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
