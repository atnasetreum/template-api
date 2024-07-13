import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';

import { SharedService } from '@shared/shared.service';
import { getArrayWhiteList } from '@shared/utils';
import {
  ConnectedClients,
  MsgWebSocketService,
} from './msg-web-socket.service';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: 'msg-web-socket',
  cors: {
    origin: getArrayWhiteList(),
    credentials: true,
  },
})
export class MsgWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private readonly logger = new Logger(MsgWebSocketGateway.name);

  constructor(
    private readonly msgWebSocketService: MsgWebSocketService,
    private readonly sharedService: SharedService,
  ) {
    setInterval(() => {
      this.totalRevenue();
    }, 3000);
  }

  afterInit(): void {
    this.logger.debug('Initialized');
  }

  private getToken(client: Socket): string {
    const cookies = cookie.parse(client.handshake.headers.cookie);
    const token = cookies['access_token'] || '';
    return token;
  }

  async validateCredentials(client: Socket): Promise<string> {
    const token = this.getToken(client);

    if (!token) {
      this.logger.error('Token not found');
      client.disconnect(true);
      return;
    }

    try {
      const { id } = this.sharedService.verifyJwt(token);
      return id;
    } catch (error) {
      this.logger.error('Token no válido');
      client.disconnect(true);
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    const userId = await this.validateCredentials(client);

    this.msgWebSocketService.addClient({ client, userId });
  }

  handleDisconnect(client: Socket): void {
    this.msgWebSocketService.removeClient(client);
  }

  @SubscribeMessage('update-total-revenue')
  handleUpdateTotalRevenue(client: Socket): void {
    this.totalRevenue(client);
  }

  emitAll(event: string, data: object): void {
    this.wss.emit(event, data);
  }

  totalRevenue(client?: Socket): void {
    const clients: ConnectedClients =
      this.msgWebSocketService.getConnectedClients();

    const getNumber = () => Math.floor(Math.random() * 5000);

    const data = [
      [getNumber(), '#0000ff'],
      [getNumber(), '#8d0073'],
      [getNumber(), '#ba0046'],
      [getNumber(), '#d60028'],
      [getNumber(), '#eb0014'],
      [getNumber(), '#fb0004'],
      [getNumber(), '#ff0000'],
    ];

    if (client) {
      client.emit('total-revenue', data);
      return;
    }

    for (const client of Object.values(clients)) {
      for (const socket of client.sockets) {
        socket.emit('total-revenue', data);
      }
    }
  }
}
