import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CargasService } from './services/cargas.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCargaDto } from './dto/create-carga.dto';

@Controller('cargas')
export class CargasController {
    constructor(private readonly _cargasService: CargasService){}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createCargaDto: CreateCargaDto, @Req() req){
        const user = req.user;
        return this._cargasService.create(createCargaDto, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Req() req) {
        const user = req.user;
        return this._cargasService.findAll(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this._cargasService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/finalizar')
    finalizar(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this._cargasService.finalizar(id, req.user);
    }
}
