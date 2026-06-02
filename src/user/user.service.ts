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

  async getMe(userId: number) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        preferredClimate: true,
        travelStyle: true,
        preferredActivities: true,
        preferredRegions: true,
        budgetRange: true,
        currency: true,
        homeCountry: true,
        groupType: true,
      },
    });
  }
}
