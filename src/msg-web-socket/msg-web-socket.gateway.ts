import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
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
    }, 5000);
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

    this.logger.debug(
      `Number of connected clients: ${this.msgWebSocketService.countConnectedClients()}`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Cliend id:${client.id} disconnected`);

    const user = this.msgWebSocketService.findUserBySocketId(client.id);

    if (!user) return;

    this.msgWebSocketService.removeClient(user);
  }

  emitAll(event: string, data: object): void {
    this.wss.emit(event, data);
  }

  totalRevenue(): void {
    const clients: ConnectedClients =
      this.msgWebSocketService.getConnectedClients();

    const getNumber = () => Math.floor(Math.random() * 50);

    const data = [
      {
        id: 'Desktop',
        data: [
          { x: 'Jan', y: getNumber() },
          { x: 'Feb', y: getNumber() },
          { x: 'Mar', y: getNumber() },
          { x: 'Apr', y: getNumber() },
          { x: 'May', y: getNumber() },
          { x: 'Jun', y: getNumber() },
        ],
      },
      {
        id: 'Mobile',
        data: [
          { x: 'Jan', y: getNumber() },
          { x: 'Feb', y: getNumber() },
          { x: 'Mar', y: getNumber() },
          { x: 'Apr', y: getNumber() },
          { x: 'May', y: getNumber() },
          { x: 'Jun', y: getNumber() },
        ],
      },
    ];

    for (const client of Object.values(clients)) {
      client.socket.emit('total-revenue', data);
    }
  }
}
