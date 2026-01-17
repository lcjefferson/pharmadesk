import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  create(createLeadDto: CreateLeadDto, companyId: string | null) {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      companyId: companyId ?? null,
    });
    return this.leadRepository.save(lead);
  }

  findAll(companyId: string | null) {
    const where = companyId ? { companyId } : {};
    return this.leadRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string | null) {
    const where: Record<string, string> = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    const lead = await this.leadRepository.findOne({ where });
    if (!lead) {
      throw new NotFoundException(`Lead #${id} not found`);
    }
    return lead;
  }

  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
    companyId: string | null,
  ) {
    const lead = await this.findOne(id, companyId);
    this.leadRepository.merge(lead, updateLeadDto);
    return this.leadRepository.save(lead);
  }

  async assign(id: string, userId: string, companyId: string | null) {
    const lead = await this.findOne(id, companyId);
    lead.assignedToId = userId;
    return this.leadRepository.save(lead);
  }

  async remove(id: string, companyId: string | null) {
    const lead = await this.findOne(id, companyId);
    return this.leadRepository.remove(lead);
  }
}
