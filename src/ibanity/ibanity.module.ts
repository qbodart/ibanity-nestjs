import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IbanityController } from './ibanity.controller';
import { AuthorizationRequest } from './authorization-request.entity';
import { IbanityService } from './ibanity.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorizationRequest]), HttpModule],
  controllers: [IbanityController],
  providers: [IbanityService],
})
export class IbanityModule {}
