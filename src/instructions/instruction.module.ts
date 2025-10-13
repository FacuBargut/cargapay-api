import { Module } from '@nestjs/common';
import { Instruction } from './entities/movement.entity/instruction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructionsService } from './instructions.service';
import { InstructionsController } from './instructions.controller';
import { Viaje } from '../viajes/entities/viaje/viaje';
import { Estadia } from '../estadias/entities/estadia/estadia';
import { Carga } from '../cargas/entities/carga.entity/carga.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Instruction, Viaje,Estadia, Carga])
  ],
  providers: [InstructionsService],
  controllers: [InstructionsController],
  
})
export class InstructionModule {}
