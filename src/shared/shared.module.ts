import { Module } from '@nestjs/common';

import { SharedService } from './shared.service';
import { PrismaService } from './services/prisma.service';

@Module({
  providers: [SharedService, PrismaService],
  exports: [SharedService, PrismaService],
})
export class SharedModule {}
