import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Get()
  getAllUsers() {
    return this.userService.getUser();
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getProfile(@GetUser('sub') userId: number) {
    return this.userService.getMe(userId);
  }
}
