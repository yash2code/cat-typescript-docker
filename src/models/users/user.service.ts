import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/users.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async findOne(username: string): Promise<User | undefined> {
        try {
            const user = await this.userModel.findOne({ username }).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            if (error.code === 'some_error_code') {
                throw new ConflictException('User already exists');
            }

            throw new BadRequestException('Bad request');
        }
    }

    async create(username: string, password: string): Promise<User> {
        try {
            const userExists = await this.userModel.findOne({ username });
            if (userExists) {
                throw new ConflictException('User already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new this.userModel({ username, password: hashedPassword });
            return newUser.save();
        } catch (error) {
            if (error instanceof ConflictException) {
                throw new ConflictException(error.message);
            }
            throw error;
        }

    }

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.findOne(username);
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }
}
