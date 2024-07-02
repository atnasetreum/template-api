import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';

import { User } from '@prisma/client';

import { NotificationsService } from './notifications.service';
import { CurrentUser } from '@shared/decorators';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/subscribe')
  subscribe(@Req() req, @CurrentUser() currentUser: User) {
    const { subscription = '' } = req.body;

    if (!subscription) {
      throw new BadRequestException('Invalid body');
    }

    return this.notificationsService.subscribe({
      subscription,
      currentUser,
    });
  }

  @Get('/key')
  getKey() {
    return this.notificationsService.getKey();
  }

  @Post('/push')
  sendPush() {
    return this.notificationsService.push();
  }
}
