import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
@Injectable()
export class AuthService {

    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
      ) {}
    
      
      async validateUser(mail: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(mail);
        if (user && (await bcrypt.compare(pass, user.password))) {
          const { password, ...result } = user;
          return result; // Devuelve el usuario sin la contraseña
        }
        return null;
      }
    
      
      async login(user: any) {
        const payload = { username: user.mail, sub: user.id };
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
}
