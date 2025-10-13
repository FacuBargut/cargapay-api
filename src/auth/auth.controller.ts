import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth-dto";
import { UserService } from "../users/user.service";
import { CreateUserDto } from "./dto/create-dto";


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.mail,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('El email o la contraseña son incorrectos');
    }
    return this.authService.login(user);
  }

  @Post('register') // <-- Creamos la ruta POST /users/register
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}