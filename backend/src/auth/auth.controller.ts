import { Controller, Post, Body, Res, HttpCode, Get, UseGuards, Req } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(data);
    const token = await this.authService.login(user);
    res.cookie(process.env.COOKIE_NAME || 'SHARED_CALENDAR_AUTH', token.access_token, this.authService.cookieOptions());
    return { user: token.user };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser((data as any).username, data.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.login(user);
    res.cookie(process.env.COOKIE_NAME || 'SHARED_CALENDAR_AUTH', token.access_token, this.authService.cookieOptions());
    return { user: token.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return { user: req.user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(process.env.COOKIE_NAME || 'SHARED_CALENDAR_AUTH', { path: '/' });
    return { success: true };
  }
}
