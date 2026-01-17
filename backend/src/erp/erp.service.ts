import { Injectable } from '@nestjs/common';

@Injectable()
export class ErpService {
  create() {
    return 'This action adds a new erp';
  }

  findAll() {
    return `This action returns all erp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} erp`;
  }

  update(id: number) {
    return `This action updates a #${id} erp`;
  }

  remove(id: number) {
    return `This action removes a #${id} erp`;
  }
}
