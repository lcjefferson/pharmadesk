import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getSummary(@Req() req: { user: { companyId: string | null } }) {
    return this.reportsService.getSummary(req.user.companyId);
  }
}
