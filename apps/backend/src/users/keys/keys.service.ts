import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { UserKeysEntity } from './keys.entity';
import { UserEntity } from '../users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserKeysService {
  private invalidatedKeyIds: { [key: string]: boolean } = {};

  constructor(
    @InjectRepository(UserKeysEntity)
    private keysRepository: Repository<UserKeysEntity>,
    private jwtService: JwtService,
  ) {}

  async verify(jwtToken: string) {
    const [type, token] = jwtToken.split(' ');
    if (type.toLowerCase() !== 'bearer') {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SIGN_SECRET,
      });
      if (!payload?.id) {
        return false;
      }

      if (this.invalidatedKeyIds[payload.id]) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async create(user: UserEntity): Promise<string> {
    const newKey = await this.keysRepository.create({ user }).save();
    return newKey.key;
  }

  async findOneBy(options: FindOneOptions<UserKeysEntity>) {
    return await this.keysRepository.findOne(options);
  }

  async delete(key: string) {
    await this.keysRepository.delete({ key });
  }
}
