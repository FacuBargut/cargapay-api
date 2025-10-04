import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estadia } from './entities/estadia/estadia';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estadia])
  ],
})
export class EstadiaModule {}
