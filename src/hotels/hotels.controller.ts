import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';

@Controller('hotels')
export class HotelsController {
    constructor(private readonly hotelsService: HotelsService) { }

    @Post()
    create(@Body() createHotelDto: CreateHotelDto) {
        return this.hotelsService.create(createHotelDto);
    }

    @Get()
    getHotels() {
        return this.hotelsService.getHotels();
    }
}
