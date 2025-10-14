import { Module } from '@nestjs/common';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rate } from './entities/rate.entity';

@Module({
  controllers: [RatesController],
  imports: [TypeOrmModule.forFeature([Rate])],
  providers: [RatesService]
})
export class RatesModule {}
