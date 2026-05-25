import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(body: CreateUserDto) {
    return this.prismaService.user.create({ data: body });
  }

  async getUser() {
    return this.prismaService.user.findMany();
  }
}
