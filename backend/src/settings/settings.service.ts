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

  findAll(companyId: string | null) {
    return this.settingsRepository.find({
      where: companyId ? { companyId } : {},
    });
  }

  async findOne(key: string, companyId: string | null) {
    const setting = await this.settingsRepository.findOne({
      where: {
        key,
        ...(companyId ? { companyId } : {}),
      },
    });
    return setting || { key, value: null };
  }

  async create(createSettingDto: CreateSettingDto, companyId: string | null) {
    const setting = this.settingsRepository.create({
      ...createSettingDto,
      companyId,
    });
    return this.settingsRepository.save(setting);
  }

  async update(
    key: string,
    updateSettingDto: UpdateSettingDto,
    companyId: string | null,
  ) {
    // Check if exists, if not create
    const existing = await this.settingsRepository.findOne({
      where: {
        key,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (existing) {
      existing.value = updateSettingDto.value as unknown;
      return this.settingsRepository.save(existing);
    } else {
      const newSetting = this.settingsRepository.create({
        key,
        value: updateSettingDto.value as unknown,
        companyId,
      });
      return this.settingsRepository.save(newSetting);
    }
  }

  async remove(key: string, companyId: string | null) {
    const setting = await this.settingsRepository.findOne({
      where: {
        key,
        ...(companyId ? { companyId } : {}),
      },
    });
    if (setting) {
      return this.settingsRepository.delete(setting.id);
    }
    return { deleted: false };
  }
}
