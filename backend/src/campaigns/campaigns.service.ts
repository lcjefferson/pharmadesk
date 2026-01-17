import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {
  Campaign,
  CampaignStatus,
  CampaignType,
} from './entities/campaign.entity';
import { ClientsService } from '../clients/clients.service';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import {
  MessageSender,
  MessageType,
} from '../messages/entities/message.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private clientsService: ClientsService,
    private messagesService: MessagesService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto) {
    const campaign = this.campaignRepository.create(createCampaignDto);
    const savedCampaign = await this.campaignRepository.save(campaign);

    // If it's a one-shot campaign and status is scheduled or running (immediate), we could trigger dispatch
    if (
      savedCampaign.type === CampaignType.ONE_SHOT &&
      savedCampaign.status === CampaignStatus.RUNNING
    ) {
      void this.dispatchCampaign(savedCampaign.id);
    }

    return savedCampaign;
  }

  findAll() {
    return this.campaignRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string) {
    return this.campaignRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    await this.campaignRepository.update(id, updateCampaignDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.campaignRepository.delete(id);
    return { deleted: true };
  }

  async dispatchCampaign(id: string) {
    const campaign = await this.findOne(id);
    if (!campaign) return;

    // 1. Fetch target audience
    // Simplified logic: fetch all clients for now, or filter by tags if implemented
    const clients = await this.clientsService.findAll();

    // Filter clients based on campaign.target (mock implementation)
    // In a real scenario, this would parse 'tag:vip' etc.
    const targetClients = clients.filter((c) => c.phone);

    let sentCount = 0;

    // 2. Send messages
    for (const client of targetClients) {
      try {
        const messageDto: CreateMessageDto = {
          content: campaign.message,
          clientId: client.id,
          type: MessageType.TEXT,
          sender: MessageSender.SYSTEM, // Or AGENT
        };
        await this.messagesService.create(messageDto);
        sentCount++;
      } catch (error) {
        console.error(
          `Failed to send campaign message to client ${client.id}`,
          error,
        );
      }
    }

    // 3. Update campaign stats
    campaign.status = CampaignStatus.COMPLETED;
    campaign.reach = sentCount;
    await this.campaignRepository.save(campaign);

    return { sent: sentCount };
  }
}
