import { InjectRepository } from "@nestjs/typeorm";
import { Carga, EstadoCarga } from "../entities/carga.entity/carga.entity";
import { In, Repository } from "typeorm";
import { CreateCargaDto } from "../dto/create-carga.dto";
import { User } from "../../users/entities/user.entity/user.entity";
import { ConflictException, ForbiddenException, NotFoundException, PreconditionFailedException } from "@nestjs/common";
import { Rate } from "../../rates/entities/rate.entity";
import { Factura } from "src/facturas/factura/entities/factura.entity";



export class CargasService {
    constructor(@InjectRepository(Carga) private _cargasRepository: Repository<Carga>,
        @InjectRepository(Rate) private _rateRepository: Repository<Rate>,
        @InjectRepository(Factura) private _facturaRepository: Repository<Factura>
    ) { }

    async create(createCargaDto: CreateCargaDto, user: User): Promise<Carga> {

        const cargaExistente = await this._cargasRepository.findOneBy({
            code: createCargaDto.code,
            user: { id: user.id }
        });

        if (cargaExistente) {
            throw new ConflictException('Ya existe una carga con ese código.');
        }

        const requiredRates = ["Valor por km recorrido", "Valor por hora de estadia", "Costo por boca"]
        const userTarifas = await this._rateRepository.find({
            where: {
                user: { id: user.id },
                name: In(requiredRates),
            }
        });

        const userTarifaNames = userTarifas.map(t => t.name);
        const missingTarifas = requiredRates.filter(rt => !userTarifaNames.includes(rt));

        if (missingTarifas.length > 0) {
            throw new PreconditionFailedException({
                message: 'Debes configurar todas las tarifas básicas.',
                missing: missingTarifas,
            });
        }

        const fechaString = createCargaDto.fecha_creacion ? String(createCargaDto.fecha_creacion) : new Date().toISOString().split('T')[0];
    
        // Al agregar 'T00:00:00', nos aseguramos de que el día no cambie por la zona horaria.
        const fechaCarga = new Date(fechaString + 'T00:00:00');
        
        const day = fechaCarga.getDate();
        const monthYear = fechaCarga.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
        const quincena = day <= 15 ? 'Primera Quincena' : 'Segunda Quincena';
        const periodo = `${monthYear} - ${quincena}`;
    
        const facturaExistente = await this._facturaRepository.findOne({
            where: {
                user: { id: user.id },
                periodo: periodo,
            }
        });
    
        if (facturaExistente) {
            throw new ConflictException('Ya existe una factura para esta quincena. Por favor, elimine la factura para poder agregar nuevas cargas.');
        }

        const newCarga = this._cargasRepository.create({
            code: createCargaDto.code,
            cantidad_bocas: createCargaDto.cantidad_bocas,
            fecha_creacion: fechaCarga,
            user: user,
        });

        return this._cargasRepository.save(newCarga);
    }

    async findAll(user: User): Promise<Carga[]> {
        return this._cargasRepository.find({
            where: { user: { id: user.id } },
            relations: [
                'user',
                'instructions',
                'instructions.viaje',
                'instructions.estadia',
                'factura'
            ],
        });
    }

    async findOne(id: number): Promise<Carga> {
        const carga = await this._cargasRepository.findOne({
            where: { id: id },
            relations: [
                'user',
                'instructions',
                'instructions.viaje',
                'instructions.estadia',
            ],
        });

        if (!carga) {
            throw new NotFoundException(`La carga con el ID ${id} no fue encontrada`);
        }

        return carga;
    }

    async finalizar(id: number, user: User): Promise<Carga> {
        const carga = await this.findOne(id); // Reutilizamos findOne para buscar la carga

        if (carga.user.id !== user.id) {
            throw new ForbiddenException('No tenés permiso para modificar esta carga');
        }

        if (carga.estado === EstadoCarga.FINALIZADA) {
            throw new ForbiddenException('Esta carga ya está finalizada.');
        }

        carga.estado = EstadoCarga.FINALIZADA;
        return this._cargasRepository.save(carga);
    }
}