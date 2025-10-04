import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Viaje } from './entities/viaje/viaje';


@Module({
  imports: [
    TypeOrmModule.forFeature([Viaje])
  ],
})
export class ViajeModule {}
