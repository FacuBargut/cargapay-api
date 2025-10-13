import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JWTStrategy } from './jwt.strategy';

@Module({
  imports:[
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: "PalabraUltraSecreta123@",
      signOptions: { expiresIn: '1440m' }
    })
  ],
  providers: [AuthService,JWTStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
