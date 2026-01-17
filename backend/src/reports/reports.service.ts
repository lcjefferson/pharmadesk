import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Message } from '../messages/entities/message.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async getSummary(companyId: string | null) {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const commonFilter = companyId ? { companyId } : {};

    const [
      totalClients,
      newClientsLast30Days,
      totalLeads,
      leadsConverted,
      totalMessages,
      messagesLast7Raw,
      totalAppointmentsUpcoming,
      totalCampaigns,
    ] = await Promise.all([
      this.clientsRepository.count({ where: commonFilter }),
      this.clientsRepository.count({
        where: { ...commonFilter, createdAt: MoreThanOrEqual(thirtyDaysAgo) },
      }),
      this.leadsRepository.count({ where: commonFilter }),
      this.leadsRepository.count({
        where: { ...commonFilter, status: 'converted' },
      }),
      this.messagesRepository.count({ where: commonFilter }),
      this.messagesRepository
        .createQueryBuilder('m')
        .select("DATE_TRUNC('day', m.createdAt)", 'date')
        .addSelect('COUNT(*)', 'count')
        .where('m.createdAt >= :from', { from: sevenDaysAgo.toISOString() })
        .andWhere(companyId ? 'm.companyId = :companyId' : '1=1', { companyId })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany(),
      this.appointmentsRepository.count({
        where: { ...commonFilter, date: MoreThanOrEqual(now) },
      }),
      this.campaignsRepository.count({ where: commonFilter }),
    ]);

    type CampaignReachRaw = { total: string | null } | null;

    const totalCampaignReachRaw = (await this.campaignsRepository
      .createQueryBuilder('c')
      .select('SUM(c.reach)', 'total')
      .where(companyId ? 'c.companyId = :companyId' : '1=1', { companyId })
      .getRawOne()) as CampaignReachRaw;

    const messagesByDayMap: Record<string, number> = {};
    messagesLast7Raw.forEach((row: { date: Date; count: string }) => {
      const d = new Date(row.date);
      const key = d.toISOString().slice(0, 10);
      messagesByDayMap[key] = parseInt(row.count, 10);
    });

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      labels.push(
        d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      );
      data.push(messagesByDayMap[key] || 0);
    }

    const leadsBySourceRaw = await this.leadsRepository
      .createQueryBuilder('l')
      .select('l.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('l.source IS NOT NULL')
      .andWhere(companyId ? 'l.companyId = :companyId' : '1=1', { companyId })
      .groupBy('l.source')
      .getRawMany();

    const leadsLabels = leadsBySourceRaw.map(
      (row: { source: string }) => row.source,
    );
    const leadsData = leadsBySourceRaw.map((row: { count: string }) =>
      parseInt(row.count, 10),
    );

    const totalRevenue = leadsConverted * 100;
    const conversionRate =
      totalLeads > 0 ? Math.round((leadsConverted / totalLeads) * 100) : 0;
    const avgTicket =
      leadsConverted > 0 ? Math.round(totalRevenue / leadsConverted) : 0;

    return {
      kpis: {
        avgResponseTime: '5m',
        newClients: newClientsLast30Days,
        messagesExchanged: totalMessages,
        aiBudgets: 0,
        totalClients,
        totalLeads,
        leadsConverted,
        totalAppointmentsUpcoming,
        totalCampaigns,
        totalCampaignReach:
          totalCampaignReachRaw &&
          typeof totalCampaignReachRaw.total === 'string'
            ? parseInt(totalCampaignReachRaw.total, 10)
            : 0,
        totalRevenue,
        conversionRate,
        avgTicket,
      },
      charts: {
        weeklyTrend: {
          labels,
          data,
        },
        leadsBySource: {
          labels: leadsLabels,
          data: leadsData,
        },
      },
    };
  }
}
