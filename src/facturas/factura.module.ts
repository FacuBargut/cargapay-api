import { Module } from '@nestjs/common';
import { Factura } from './factura/entities/factura.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaController } from './factura.controller';
import { FacturaService } from './factura.service';
import { Carga } from '../cargas/entities/carga.entity/carga.entity';
import { Rate } from '../rates/entities/rate.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Factura, Carga, Rate])],
    controllers: [FacturaController],
    providers: [FacturaService],
})
export class FacturaModule {
}
