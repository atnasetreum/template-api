import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from './dto';
import { SharedService } from '@shared/shared.service';
import { PrismaService } from '@shared/services';

@Injectable()
export class UsersService {
  constructor(
    private readonly sharedService: SharedService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const passwordEncrypted = await this.sharedService.encryptPassword(
      createUserDto.password,
    );

    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: passwordEncrypted,
      },
    });

    return this.sharedService.excludeFromObject(user, ['password']);
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      /*include: {
        subscriptions: true,
      },*/
    });

    return this.sharedService.excludeFromList(users, ['password']);
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.sharedService.excludeFromObject(user, ['password']);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const user = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.sharedService.excludeFromObject(user, ['password']);
  }

  async remove(id: string) {
    await this.findOne(id);

    const user = await this.prismaService.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return this.sharedService.excludeFromObject(user, ['password']);
  }
}
