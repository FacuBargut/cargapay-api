import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


interface JwtPayload {
    sub: number;
    mail: string;
  }

export class JWTStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'PalabraUltraSecreta123@'
        })
    }

    async validate(payload: JwtPayload): Promise<{ id: number; mail: string }> {
        return { id: payload.sub, mail: payload.mail };
      }
}