import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InviteEntity } from './invite.entity';
import { UserEntity } from '../users/users.entity';
import {
  InviteCreateResponse,
  InviteFetchResponse,
} from '$shared/types/Invite';

export class InviteService {
  constructor(
    @InjectRepository(InviteEntity)
    private invitesRepository: Repository<InviteEntity>,
  ) {}

  async getAll(page: number = 0): Promise<InviteFetchResponse> {
    const [invites, total] = await this.invitesRepository.findAndCount({
      order: { id: 'DESC' },
      take: 10,
      skip: page * 10,
      relations: ['used_by', 'created_by'],
    });

    return {
      invites: invites.map((invite) => ({
        id: invite.id,
        code: invite.code,
        usedBy: invite.used_by?.email || '-',
        createdBy: invite.created_by?.email || '-',
      })),
      total,
    };
  }

  async create(asUser: UserEntity, code = ''): Promise<InviteCreateResponse> {
    const invite = this.invitesRepository.create({
      code,
      created_by: asUser,
    });

    const created = await invite.save();

    return {
      id: created.id,
      code: created.code,
      createdBy: created.created_by?.email || '-',
    };
  }

  async findByCode(code: string) {
    return this.invitesRepository.findOne({
      where: { code },
    });
  }

  async setUsedBy(inviteCode: string, user: UserEntity) {
    return this.invitesRepository.update(
      { code: inviteCode },
      { used_by: user },
    );
  }

  async deleteByCode(code: string) {
    await this.invitesRepository.delete({ code });
  }

  async deleteById(id: number) {
    await this.invitesRepository.delete({ id });
  }
}
