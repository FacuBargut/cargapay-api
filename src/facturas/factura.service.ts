import { Injectable, NotFoundException, PreconditionFailedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DataSource, In, Repository } from "typeorm";
import { Factura } from "./factura/entities/factura.entity";
import { Carga, EstadoCarga } from "../cargas/entities/carga.entity/carga.entity";
import { User } from "../users/entities/user.entity/user.entity";
import { Rate } from "src/rates/entities/rate.entity";


@Injectable()
export class FacturaService {

    constructor(
        private _dataSource: DataSource,
        @InjectRepository(Factura) private _facturaRepository: Repository<Factura>,
        @InjectRepository(Carga) private _cargaRepository: Repository<Carga>,
        @InjectRepository(Rate) private _rateRepository: Repository<Rate>
    ) { }

    async facturarQuincena(monthYear: string, quincena: string, user: User): Promise<Factura> {

        const tarifaBoca = await this._rateRepository.findOne({
            where: { user: { id: user.id }, name: "Costo por boca" }
        });

        if (!tarifaBoca) {
            throw new PreconditionFailedException('La tarifa "Costo por boca" es necesaria para poder facturar.');
        }

        
        const valorBoca = tarifaBoca.value;

        const { startDate, endDate } = this._getPeriodoFechas(monthYear, quincena);
        const queryRunner = this._dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const cargasAFacturar = await queryRunner.manager.find(Carga, {
                where: {
                    user: { id: user.id },
                    estado: EstadoCarga.ACTIVA,
                    fecha_creacion: Between(startDate, endDate),
                },
                relations: ['instructions', 'instructions.viaje', 'instructions.estadia'],
            });

            if (cargasAFacturar.length === 0) {
                throw new NotFoundException('No hay cargas activas para facturar en este período.');
            }

            const montoTotal = cargasAFacturar.reduce((total, carga) => {
                
                const montoInstrucciones = carga.instructions.reduce((subtotal, inst) => {
                    if (inst.viaje) {
                        return subtotal + Number(inst.viaje.amount);
                    }
                    if (inst.estadia) {
                        return subtotal + Number(inst.estadia.amount);
                    }
                    return subtotal;
                }, 0);
            
                
                let montoBocas = 0;
                
                const nivelesBoca = tarifaBoca?.configuracion_escalonada?.niveles;
            
                if (nivelesBoca) {
                    
                    for (const nivel of nivelesBoca) {
                        
                        if (carga.cantidad_bocas >= nivel.desde && carga.cantidad_bocas <= nivel.hasta) {
                            montoBocas = Number(nivel.monto);
                            break;
                        }
                    }
                }
                
                return total + montoInstrucciones + montoBocas;
            }, 0);

            
            const nuevaFactura = queryRunner.manager.create(Factura, {
                periodo: `${monthYear} - ${quincena}`,
                monto_total: montoTotal,
                user: user,
            });
            const facturaGuardada = await queryRunner.manager.save(nuevaFactura);

            for (const carga of cargasAFacturar) {
                carga.estado = EstadoCarga.FINALIZADA;
                carga.factura = facturaGuardada;
            }
            await queryRunner.manager.save(Carga, cargasAFacturar);

            await queryRunner.commitTransaction();
            return facturaGuardada;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private _getPeriodoFechas(monthYear: string, quincena: string): { startDate: Date, endDate: Date } {
        const meses = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };
        
        const cleanMonthYear = monthYear.toLowerCase().replace(' de ', ' ');
        const [monthName, year] = cleanMonthYear.split(' ');
        
        const month = meses[monthName];
        const numericYear = parseInt(year, 10);
    
        if (month === undefined || isNaN(numericYear)) {
            throw new Error('Formato de fecha inválido. Se esperaba "mes año".');
        }
    
        let startDate, endDate;
        if (quincena === 'Primera Quincena') {
            startDate = new Date(numericYear, month, 1);
            endDate = new Date(numericYear, month, 15, 23, 59, 59);
        } else { // Segunda Quincena
            startDate = new Date(numericYear, month, 16);
            endDate = new Date(numericYear, month + 1, 0, 23, 59, 59);
        }
    
        return { startDate, endDate };
    }


    async findOne(id: number, user: User): Promise<Factura> {
        const factura = await this._facturaRepository.findOne({
            where: { id, user: { id: user.id } },
            relations: [
                'cargas', 
                'cargas.instructions', 
                'cargas.instructions.viaje', 
                'cargas.instructions.estadia'
            ],
        });
        if (!factura) {
            throw new NotFoundException('Factura no encontrada');
        }
        return factura;
    }

    async eliminarFactura(id: number, user: User): Promise<{ message: string }> {
        const queryRunner = this._dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            // 1. Buscamos la factura y sus cargas asociadas
            const factura = await queryRunner.manager.findOne(Factura, {
                where: { id, user: { id: user.id } },
                relations: ['cargas'],
            });
    
            if (!factura) {
                throw new NotFoundException('Factura no encontrada o no tenés permiso sobre ella.');
            }
    
            const cargasAReabrir = factura.cargas;
    
            // 2. Revertimos el estado de las cargas y quitamos la referencia a la factura
            for (const carga of cargasAReabrir) {
                carga.estado = EstadoCarga.ACTIVA;
                carga.factura = null;
            }
            await queryRunner.manager.save(Carga, cargasAReabrir);
    
            // 3. Eliminamos la factura
            await queryRunner.manager.remove(Factura, factura);
    
            // 4. Confirmamos la transacción
            await queryRunner.commitTransaction();
    
            return { message: 'Factura eliminada y cargas reabiertas exitosamente.' };
    
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}