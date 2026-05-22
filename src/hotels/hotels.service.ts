import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(readonly prisma: PrismaService) { }

  async create(data: CreateHotelDto) {
    return this.prisma.hotel.create({ data });
  }

  async getHotels() {
    return this.prisma.hotel.findMany();
  }


}
