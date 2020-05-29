import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IbanityModule } from './ibanity/ibanity.module';
import { config } from './config';

@Module({
  imports: [
    TypeOrmModule.forRoot(config.typeOrm as TypeOrmModuleOptions),
    IbanityModule,
  ],
})
export class AppModule {}
