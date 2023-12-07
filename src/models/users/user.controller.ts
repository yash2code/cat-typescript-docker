import { Controller, Get, Post, Body, Param, BadRequestException, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body('username') username: string, @Body('password') password: string) {
        if (!username || !password) {
            throw new BadRequestException('Username and password are required!');
        }
        const createdUser = await this.userService.create(username, password);
        const { password: p, ...result } = createdUser.toObject();
        return result;
    }

    // @Get(':username')
    // async getProfile(@Param('username') username: string) {
    //     const user = await this.userService.findOne(username);
    //     if (!user) {
    //         throw new BadRequestException('User not found!');
    //     }
    //     const { password, ...result } = user.toObject();
    //     return result;
    // }
}
