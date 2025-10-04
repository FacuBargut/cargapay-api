import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { InstructionsService } from './instructions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateInstructionDto } from './dto/create-instruction';
import { User } from 'src/users/entities/user.entity/user.entity';
import { UpdateInstructionDto } from './dto/update-instruction';

@Controller('instructions')
export class InstructionsController {
    constructor(private readonly _instructionService: InstructionsService){}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createInstructionDto: CreateInstructionDto, @Req() req){
        const user = req.user as User;
        return this._instructionService.create(createInstructionDto, user);
    }


    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this._instructionService.remove(id, req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateInstructionDto, @Req() req) {
        return this._instructionService.update(id, updateDto, req.user);
    }
}
