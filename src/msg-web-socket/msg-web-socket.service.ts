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
  socket: Socket;
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

  validateClientRepited(user: User): boolean {
    return !!this.connectedClients[user.id];
  }

  async addClient({
    client,
    userId,
  }: {
    client: Socket;
    userId: string;
  }): Promise<void> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
    }

    if (this.validateClientRepited(user)) {
      this.removeClient(user);
    }

    const currentData = {
      socket: client,
      user,
    };

    this.connectedClients[userId] = currentData;

    this.logger.debug(
      `Client with email: "${currentData.user.email}" connected`,
    );

    this.loadDataInitial(currentData);
  }

  async loadDataInitial(currentData: CurrentData): Promise<void> {
    const users = await this.usersService.findAll();

    currentData.socket.emit('load-data-initial', {
      users,
      currentUser: currentData.user,
    });
  }

  removeClient(user: User): void {
    delete this.connectedClients[user.id];
  }

  findUserBySocketId(socketId: string): User | null {
    const userId = Object.keys(this.connectedClients).find(
      (key) => this.connectedClients[key].socket.id === socketId,
    );

    return userId ? this.connectedClients[userId].user : null;
  }

  countConnectedClients(): number {
    return Object.keys(this.connectedClients).length;
  }

  getConnectedClients(): ConnectedClients {
    return { ...this.connectedClients };
  }
}
