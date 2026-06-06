import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return null;
    }
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        color: user.color,
      },
    };
  }

  async register(data: { name: string; username: string; email?: string; password: string }) {
    const existing = await this.usersService.findByUsername(data.username);
    if (existing) {
      throw new BadRequestException('Username already registered');
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        name: data.name,
        email: data.email || null,
        passwordHash: hashed,
        color: '#2196F3',
      },
    });
    await this.prisma.calendar.create({
      data: {
        name: `${data.name} のカレンダー`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'admin' } },
      },
    });
    return user;
  }

  cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60,
    };
  }
}
