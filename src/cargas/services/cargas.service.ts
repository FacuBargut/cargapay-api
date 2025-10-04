import { InjectRepository } from "@nestjs/typeorm";
import { Carga, EstadoCarga } from "../entities/carga.entity/carga.entity";
import { Repository } from "typeorm";
import { CreateCargaDto } from "../dto/create-carga.dto";
import { User } from "src/users/entities/user.entity/user.entity";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";



export class CargasService {
    constructor(@InjectRepository(Carga) private _cargasRepository: Repository<Carga>) {}

    async create(createCargaDto : CreateCargaDto, user : User): Promise<Carga>{

        console.log(createCargaDto.code)
        const existCarga = await this._cargasRepository.findOneBy({
            code: createCargaDto.code,
          });

        if(existCarga){
            throw new ConflictException('La carga con ese código ya existe');
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