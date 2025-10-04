import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsNotEmpty()
    last_name: string;
    
    @IsString()
    @IsNotEmpty()
    company: string;
  
    @IsEmail()
    mail: string;
  
    @IsString()
    password: string;
  }