import { Injectable } from '@nestjs/common';

@Injectable()
export class IaService {
  create() {
    return 'This action adds a new ia';
  }

  findAll() {
    return `This action returns all ia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ia`;
  }

  update(id: number) {
    return `This action updates a #${id} ia`;
  }

  remove(id: number) {
    return `This action removes a #${id} ia`;
  }
}
