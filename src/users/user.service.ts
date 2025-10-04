import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/create-dto';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
      ) {}
    
      async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
        const newUser = this.usersRepository.create({
          ...createUserDto,
          password: hashedPassword,
        });
        
        return this.usersRepository.save(newUser);
      }
      
      // Agregamos este método para buscar un usuario por email, lo usaremos en el login
      async findOneByEmail(mail: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ mail });
      }
}
