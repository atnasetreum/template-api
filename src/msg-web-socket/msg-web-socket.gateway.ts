import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

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

  constructor(private readonly msgWebSocketService: MsgWebSocketService) {
    setInterval(() => {
      this.totalRevenue();
    }, 5000);
  }

  handleConnection(client: Socket) {
    // Add your implementation here
    console.log('Client connected:', client.id);
    this.msgWebSocketService.addClient(client);

    console.log(
      'connected-clients: ',
      this.msgWebSocketService.countConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // Add your implementation here
    console.log('Client disconnected:', client.id);
    this.msgWebSocketService.removeClient(client);
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
      client.emit('total-revenue', data);
    }
  }
}
