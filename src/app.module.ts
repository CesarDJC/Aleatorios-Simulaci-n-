import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EscenariosModule } from './escenarios/escenarios.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosModule } from './productos/productos.module';
import { GastosModule } from './gastos/gastos.module';

@Module({
  imports: [EscenariosModule,

    ConfigModule.forRoot({
      envFilePath:'.env',
      isGlobal:true
    }),

    TypeOrmModule.forRootAsync({
      inject:[ConfigService],

      useFactory:(configService:ConfigService)=>({
        type:'postgres',
        host:configService.get('DB_HOST'),
        port:+configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password:configService.get('DB_PASSWORD'),
        database:configService.get('DB_NAME'),
        autoLoadEntities:true,
        synchronize:true,
        ssl:{
          rejectUnauthorized:false
        }
      })
    }),

    ProductosModule,

    GastosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
