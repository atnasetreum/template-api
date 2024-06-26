import { Module } from '@nestjs/common';

import { MsgWebSocketService } from './msg-web-socket.service';
import { MsgWebSocketGateway } from './msg-web-socket.gateway';

@Module({
  providers: [MsgWebSocketGateway, MsgWebSocketService],
})
export class MsgWebSocketModule {}
