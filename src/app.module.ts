import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity/user.entity';
import { Carga } from './cargas/entities/carga.entity/carga.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { ViajeModule } from './viajes/viaje.module';
import { InstructionModule } from './instructions/instruction.module';
import { EstadiaModule } from './estadias/estadia.module';
import { Estadia } from './estadias/entities/estadia/estadia';
import { Viaje } from './viajes/entities/viaje/viaje';
import { CargasModule } from './cargas/cargas.module';
import { Instruction } from './instructions/entities/movement.entity/instruction.entity';
import { ConfigModule } from '@nestjs/config';
import { FacturaModule } from './facturas/factura.module';
import { Factura } from './facturas/factura/entities/factura.entity';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // <-- Usa la variable de entorno
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      autoLoadEntities: true,
      synchronize: true,
      entities: [
        User, Carga, Instruction, Estadia, Viaje, Factura
      ],
      extra: {
        family: 4,
      }
    }),
    AuthModule,
    UsersModule,
    ViajeModule,
    InstructionModule,
    EstadiaModule,
    CargasModule,
    FacturaModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
