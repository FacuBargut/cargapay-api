import { Module } from '@nestjs/common';
import { CargasService } from './services/cargas.service';
import { CargasController } from './cargas.controller';
import { Carga } from './entities/carga.entity/carga.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rate } from '../rates/entities/rate.entity';
import { Factura } from '../facturas/factura/entities/factura.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Carga, Rate, Factura])],
    providers: [CargasService],
    controllers: [CargasController]
})
export class CargasModule {

}
