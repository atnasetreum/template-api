import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { CreateUserDto, UpdateUserDto } from './dto';
import { SharedService } from '@shared/shared.service';

@Injectable()
export class UsersService extends PrismaClient implements OnModuleInit {
  constructor(private readonly sharedService: SharedService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async create(createUserDto: CreateUserDto) {
    const passwordEncrypted = await this.sharedService.encryptPassword(
      createUserDto.password,
    );

    const user = await this.user.create({
      data: {
        ...createUserDto,
        password: passwordEncrypted,
      },
    });

    return this.sharedService.excludeFromObject(user, ['password']);
  }

  async findAll() {
    const users = await this.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.sharedService.excludeFromList(users, ['password']);
  }

  async findOne(id: string) {
    const user = await this.user.findUnique({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.sharedService.excludeFromObject(user, ['password']);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const user = await this.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.sharedService.excludeFromObject(user, ['password']);
  }

  async remove(id: string) {
    await this.findOne(id);

    const user = await this.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return this.sharedService.excludeFromObject(user, ['password']);
  }
}
