import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
    username: string,
    password: string,
  ): Promise<{ message: string; user: User }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return { message: 'User created successfully', user };
  }

  async findAll(): Promise<{ message: string; users: User[] }> {
    const users = await this.prisma.user.findMany();
    return { message: 'Users retrieved successfully', users };
  }

  async findOne(username: string): Promise<{ message: string; user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User retrieved successfully', user };
  }

  async update(
    id: number,
    username: string,
    password: string,
  ): Promise<{ message: string; user: User }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username,
        password: hashedPassword,
      },
    });

    return { message: 'User updated successfully', user };
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
    return { message: `User ${user.username} deleted successfully` };
  }
}
