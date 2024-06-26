import { Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';

export interface ConnectedClients {
  [id: string]: Socket;
}

@Injectable()
export class MsgWebSocketService {
  private connectedClients: ConnectedClients = {};

  addClient(client: Socket): void {
    this.connectedClients[client.id] = client;
  }

  removeClient(client: Socket): void {
    delete this.connectedClients[client.id];
  }

  countConnectedClients(): number {
    return Object.keys(this.connectedClients).length;
  }

  getConnectedClients(): ConnectedClients {
    return { ...this.connectedClients };
  }
}
