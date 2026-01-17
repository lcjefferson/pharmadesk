import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto, companyId: string | null) {
    const client = this.clientRepository.create({
      ...createClientDto,
      companyId: companyId ?? null,
    });
    return this.clientRepository.save(client);
  }

  findAll(companyId: string | null) {
    const where = companyId ? { companyId } : {};
    return this.clientRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string | null) {
    const where: Record<string, string> = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    const client = await this.clientRepository.findOne({ where });
    if (!client) {
      throw new NotFoundException(`Client #${id} not found`);
    }
    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    companyId: string | null,
  ) {
    const client = await this.findOne(id, companyId);
    this.clientRepository.merge(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async assign(id: string, userId: string, companyId: string | null) {
    const client = await this.findOne(id, companyId);
    client.assignedToId = userId;
    return this.clientRepository.save(client);
  }

  async remove(id: string, companyId: string | null) {
    const client = await this.findOne(id, companyId);
    return this.clientRepository.remove(client);
  }
}
