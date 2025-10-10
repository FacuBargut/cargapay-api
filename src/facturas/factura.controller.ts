import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FacturaService } from './factura.service';

@Controller('facturacion')
export class FacturaController {

    constructor(private readonly _facturacionService: FacturaService) { }
    @UseGuards(AuthGuard('jwt'))
    @Post('quincena')
    facturarQuincena(@Body() body: { monthYear: string; quincena: string }, @Req() req) {
        console.log(body)
        return this._facturacionService.facturarQuincena(body.monthYear, body.quincena, req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this._facturacionService.findOne(id, req.user);
    }

}
