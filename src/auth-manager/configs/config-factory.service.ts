import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthManagerConfig,
  MongoConfig,
  RedisConfig,
} from './config-factory.modal';

@Injectable()
export class ConfigFactoryService {
  #authConfig: AuthManagerConfig;
  #mongoConfig: MongoConfig;
  #redisConfig: RedisConfig;

  constructor(private readonly configService: ConfigService) {}

  get auth() {
    if (this.#authConfig) return this.#authConfig;
    return (this.#authConfig = <AuthManagerConfig>{
      username: this.configService.get<string>('AuthManagerConfig.USERNAME'),
      password: this.configService.get<string>('AuthManagerConfig.PASSWORD'),
      email: this.configService.get<string>('AuthManagerConfig.EMAIL'),
      accessTokenTTL: this.configService.get<number>(
        'AuthManagerConfig.ACCESS_TOKEN_TTL',
      ),
      refreshTokenTTL: this.configService.get<number>(
        'AuthManagerConfig.REFRESH_TOKEN_TTL',
      ),
      tokenSecret: this.configService.get<string>(
        'AuthManagerConfig.TOKEN_SECRET',
      ),
    });
  }

  get mongo() {
    if (this.#mongoConfig) return this.#mongoConfig;
    return (this.#mongoConfig = <MongoConfig>{
      uri: this.configService.get<string>('MongoConfig.URI'),
      ssl: this.configService.get<boolean>('MongoConfig.SSL'),
      sslValidate: this.configService.get<boolean>('MongoConfig.SSL_VALIDATE'),
      dbName: this.configService.get<string>('MongoConfig.DB_NAME'),
      user: this.configService.get<string>('MongoConfig.USER'),
      pass: this.configService.get<string>('MongoConfig.PASS'),
    });
  }

  get redis() {
    if (this.#redisConfig) return this.#redisConfig;
    return (this.#redisConfig = <RedisConfig>{
      host: this.configService.get<string>('RedisConfig.HOST'),
      port: this.configService.get<number>('RedisConfig.PORT'),
      ttl: this.configService.get<number>('RedisConfig.TTL'),
      max: this.configService.get<number>('RedisConfig.MAX'),
      db: this.configService.get<number>('RedisConfig.DB_INDEX'),
      password: this.configService.get<string>('RedisConfig.PASS'),
    });
  }
}
