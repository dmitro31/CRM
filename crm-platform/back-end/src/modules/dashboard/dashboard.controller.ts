import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':workspaceId')
  async getDashboard(@Param('workspaceId') workspaceId: string) {
    return this.dashboardService.getWorkspaceDashboard(workspaceId);
  }
}