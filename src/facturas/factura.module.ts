import { Module } from '@nestjs/common';
import { Factura } from './factura/entities/factura.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaController } from './factura.controller';
import { FacturaService } from './factura.service';
import { Carga } from 'src/cargas/entities/carga.entity/carga.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Factura, Carga])],
    controllers: [FacturaController],
    providers: [FacturaService],
})
export class FacturaModule {
}
