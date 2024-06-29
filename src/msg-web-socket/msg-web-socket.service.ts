import { Injectable, Logger } from '@nestjs/common';

import { Socket } from 'socket.io';

import { UsersService } from 'src/users/users.service';

type User = Omit<
  {
    id: string;
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  'password'
>;

interface CurrentData {
  sockets: [Socket];
  user: User;
}

export interface ConnectedClients {
  [id: string]: CurrentData;
}

@Injectable()
export class MsgWebSocketService {
  private readonly logger = new Logger(MsgWebSocketService.name);

  private connectedClients: ConnectedClients = {};

  constructor(private readonly usersService: UsersService) {}

  async addClient({
    client,
    userId,
  }: {
    client: Socket;
    userId: string;
  }): Promise<void> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      this.logger.error(`User with id: "${userId}" not found`);
      client.disconnect(true);
      return;
    }

    const rowCurrent = this.connectedClients[userId] || null;

    this.logger.debug(`Client with email: "${user.email}" connected`);

    if (rowCurrent) {
      rowCurrent.sockets.push(client);
      this.connectedClients[userId] = rowCurrent;

      this.logger.debug(
        `[${user.email}]: Number of connected clients: ${rowCurrent.sockets.length}`,
      );

      return;
    }

    const currentData: CurrentData = {
      sockets: [client],
      user,
    };

    this.connectedClients[userId] = currentData;

    this.logger.debug(
      `Number of connected clients: ${this.countConnectedClients()}`,
    );

    this.loadDataInitial(client, user);
  }

  async loadDataInitial(client: Socket, currentUser: User): Promise<void> {
    const users = await this.usersService.findAll();

    client.emit('load-data-initial', {
      users,
      currentUser,
    });
  }

  removeClient(client: Socket): void {
    const user = this.findUserBySocketId(client.id);

    if (!user) return;

    delete this.connectedClients[user.id];

    this.logger.debug(`Cliend with email: "${user.email}" disconnected`);
  }

  findUserBySocketId(socketId: string): User | null {
    for (const id in this.connectedClients) {
      const { sockets } = this.connectedClients[id];

      for (const socket of sockets) {
        if (socket.id === socketId) {
          return this.connectedClients[id].user;
        }
      }
    }

    return null;
  }

  countConnectedClients(): number {
    return Object.keys(this.connectedClients).length;
  }

  getConnectedClients(): ConnectedClients {
    return { ...this.connectedClients };
  }
}
