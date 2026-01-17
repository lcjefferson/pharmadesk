import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createCampaignDto: CreateCampaignDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.campaignsService.create(createCampaignDto, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req: { user: { companyId: string | null } }) {
    return this.campaignsService.findAll(req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.campaignsService.findOne(id, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.campaignsService.update(
      id,
      updateCampaignDto,
      req.user.companyId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.campaignsService.remove(id, req.user.companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/dispatch')
  dispatch(
    @Param('id') id: string,
    @Req() req: { user: { companyId: string | null } },
  ) {
    return this.campaignsService.dispatchCampaign(id, req.user.companyId);
  }
}
