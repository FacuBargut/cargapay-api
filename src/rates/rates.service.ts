import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rate } from './entities/rate.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity/user.entity';
import { CreateRateDto } from './dto/create-rate-dto';
import { UpdateRateDto } from './dto/update-rate-dto';

@Injectable()
export class RatesService {
    constructor(
        @InjectRepository(Rate)
        private readonly _rateRepository: Repository<Rate>,
    ) {}


    async findAllByUser(user: User): Promise<Rate[]> {
        return this._rateRepository.find({
            where: {
                user: { id: user.id }
            },
            order: {
                name: 'ASC'
            }
        });
    }

    async create(createRateDto: CreateRateDto, user: User): Promise<Rate>{
        try{
            const newRate = this._rateRepository.create({
                ...createRateDto,
                user:user  
            });

            return await this._rateRepository.save(newRate);
        }catch(error){
            if(error.code === '23505'){
                throw new ConflictException('Ya existe una tarifa con el mismo nombre');
            }
            throw error;
        }
    }

    async update(id: number, updateRateDto: UpdateRateDto, user: User): Promise<Rate> {
        const rate = await this._rateRepository.findOneBy({ id, user: { id: user.id } });
        
        if (!rate) {
            throw new NotFoundException('Tarifa no encontrada o no tenés permiso para editarla.');
        }
        
        // Fusiona los datos viejos con los nuevos
        const updatedRate = this._rateRepository.merge(rate, updateRateDto);
        
        return this._rateRepository.save(updatedRate);
    }
    
    async remove(id: number, user: User): Promise<void> {
        const rate = await this._rateRepository.findOneBy({ id, user: { id: user.id } });
    
        if (!rate) {
            throw new NotFoundException('Tarifa no encontrada o no tenés permiso para eliminarla.');
        }
        
        await this._rateRepository.remove(rate);
    }
}
