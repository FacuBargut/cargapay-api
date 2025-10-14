import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RatesService } from './rates.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateRateDto } from './dto/create-rate-dto';
import { UpdateRateDto } from './dto/update-rate-dto';

@Controller('rates')
export class RatesController {

    constructor(private readonly _ratesService: RatesService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Req() req) {
        return this._ratesService.findAllByUser(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createRateDto: CreateRateDto, @Req() req) {
        return this._ratesService.create(createRateDto, req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRateDto: UpdateRateDto, 
        @Req() req
    ) {
        return this._ratesService.update(id, updateRateDto, req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this._ratesService.remove(id, req.user);
    }
}
