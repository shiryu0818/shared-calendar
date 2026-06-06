import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import 'dotenv/config';

const cookieExtractor = (req: any): string | null => {
  if (!req || !req.cookies) {
    return null;
  }
  return req.cookies[process.env.COOKIE_NAME || 'SHARED_CALENDAR_AUTH'] || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretlocal',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}
