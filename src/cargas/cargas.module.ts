import { Module } from '@nestjs/common';
import { CargasService } from './services/cargas.service';
import { CargasController } from './cargas.controller';
import { Carga } from './entities/carga.entity/carga.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Carga])],
    providers: [CargasService],
    controllers: [CargasController]
})
export class CargasModule {

}
