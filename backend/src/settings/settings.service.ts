import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  findAll() {
    return this.settingsRepository.find();
  }

  async findOne(key: string) {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting || { key, value: null };
  }

  async create(createSettingDto: CreateSettingDto) {
    const setting = this.settingsRepository.create(createSettingDto);
    return this.settingsRepository.save(setting);
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    // Check if exists, if not create
    const existing = await this.settingsRepository.findOne({ where: { key } });
    if (existing) {
      existing.value = updateSettingDto.value as unknown;
      return this.settingsRepository.save(existing);
    } else {
      const newSetting = this.settingsRepository.create({
        key,
        value: updateSettingDto.value as unknown,
      });
      return this.settingsRepository.save(newSetting);
    }
  }

  remove(key: string) {
    return this.settingsRepository.delete(key);
  }
}
