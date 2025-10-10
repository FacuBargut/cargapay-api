import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DataSource, Repository } from "typeorm";
import { Factura } from "./factura/entities/factura.entity";
import { Carga, EstadoCarga } from "src/cargas/entities/carga.entity/carga.entity";
import { User } from "src/users/entities/user.entity/user.entity";

@Injectable()
export class FacturaService {

    constructor(
        private _dataSource : DataSource,
        @InjectRepository(Factura) private _facturaRepository : Repository<Factura>,
        @InjectRepository(Carga) private _cargaRepository: Repository<Carga>
    ){}

    async facturarQuincena(monthYear: string, quincena: string, user: User): Promise<Factura> {
        const { startDate, endDate } = this._getPeriodoFechas(monthYear, quincena);

        // Iniciamos el Query Runner para la transacción
        const queryRunner = this._dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Buscar todas las cargas 'activas' del usuario para ese período.
            // Usamos queryRunner.manager para que todas las operaciones estén en la misma transacción.
            const cargasAFacturar = await queryRunner.manager.find(Carga, {
                where: {
                    user: { id: user.id },
                    estado: EstadoCarga.ACTIVA,
                    fecha_creacion: Between(startDate, endDate),
                },
                relations: ['instructions', 'instructions.viaje', 'instructions.estadia'],
            });

            // 2. Si no hay cargas, lanzamos un error y revertimos la transacción.
            if (cargasAFacturar.length === 0) {
                throw new NotFoundException('No hay cargas activas para facturar en este período.');
            }

            // 3. Calcular el monto total.
            const montoTotal = cargasAFacturar.reduce((total, carga) => {
                const montoCarga = carga.instructions.reduce((subtotal, inst) => {
                    if (inst.tipo === 'viaje' && inst.viaje) {
                        subtotal += Number(inst.viaje.cant_km) * Number(carga.valor_km_recorrido);
                    }
                    if (inst.tipo === 'estadia' && inst.estadia) {
                        subtotal += Number(inst.estadia.horas_estadia) * Number(carga.valor_hora_estadia);
                    }
                    return subtotal;
                }, 0);
                return total + montoCarga;
            }, 0);

            // 4. Crear la nueva factura.
            const nuevaFactura = queryRunner.manager.create(Factura, {
                periodo: `${monthYear} - ${quincena}`,
                monto_total: montoTotal,
                user: user,
            });
            const facturaGuardada = await queryRunner.manager.save(nuevaFactura);

            // 5. Actualizar las cargas para finalizarlas y vincularlas a la factura.
            for (const carga of cargasAFacturar) {
                carga.estado = EstadoCarga.FINALIZADA;
                carga.factura = facturaGuardada;
            }
            await queryRunner.manager.save(Carga, cargasAFacturar);

            // 6. Si todo salió bien, confirmamos la transacción.
            await queryRunner.commitTransaction();

            return facturaGuardada;

        } catch (error) {
            // 7. Si algo falla, revertimos todos los cambios.
            await queryRunner.rollbackTransaction();
            throw error; // Relanzamos el error para que el controlador lo atrape.
        } finally {
            // 8. Liberamos el query runner.
            await queryRunner.release();
        }

        
    }

    private _getPeriodoFechas(monthYear: string, quincena: string): { startDate: Date, endDate: Date } {
        const meses = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };
        
        // Hacemos el parseo más robusto
        const cleanMonthYear = monthYear.toLowerCase().replace(' de ', ' ');
        const [monthName, year] = cleanMonthYear.split(' ');
        
        // ... el resto de la función se mantiene igual ...
        const month = meses[monthName];
        const numericYear = parseInt(year, 10);
    
        // Verificamos si el mes y el año son válidos
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
            relations: ['cargas', 'cargas.instructions', 'cargas.instructions.viaje', 'cargas.instructions.estadia'],
        });
        if (!factura) {
            throw new NotFoundException('Factura no encontrada');
        }
        return factura;
    }
}