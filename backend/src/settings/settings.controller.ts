import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req: { user: { companyId: string | null } }) {
    return this.settingsService.findAll(req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':key')
  findOne(
    @Param('key') key: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.settingsService.findOne(key, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createSettingDto: CreateSettingDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.settingsService.create(createSettingDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':key')
  update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.settingsService.update(
      key,
      updateSettingDto,
      req.user.companyId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':key')
  remove(
    @Param('key') key: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.settingsService.remove(key, req.user.companyId);
  }
}
