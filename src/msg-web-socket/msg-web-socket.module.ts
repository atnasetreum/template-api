import { Module } from '@nestjs/common';

import { MsgWebSocketService } from './msg-web-socket.service';
import { MsgWebSocketGateway } from './msg-web-socket.gateway';
import { UsersModule } from 'src/users/users.module';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [UsersModule, SharedModule],
  providers: [MsgWebSocketGateway, MsgWebSocketService],
  exports: [MsgWebSocketService],
})
export class MsgWebSocketModule {}
