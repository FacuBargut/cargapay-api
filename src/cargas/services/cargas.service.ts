import { InjectRepository } from "@nestjs/typeorm";
import { Carga, EstadoCarga } from "../entities/carga.entity/carga.entity";
import { In, Repository } from "typeorm";
import { CreateCargaDto } from "../dto/create-carga.dto";
import { User } from "../../users/entities/user.entity/user.entity";
import { ForbiddenException, NotFoundException, PreconditionFailedException } from "@nestjs/common";
import { Rate } from "../../rates/entities/rate.entity";



export class CargasService {
    constructor(@InjectRepository(Carga) private _cargasRepository: Repository<Carga>, @InjectRepository(Rate) private _rateRepository: Repository<Rate>) { }

    async create(createCargaDto: CreateCargaDto, user: User): Promise<Carga> {

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

        const newCarga = this._cargasRepository.create({
            ...createCargaDto,
            user: user
        })

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