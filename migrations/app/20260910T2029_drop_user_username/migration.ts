#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7cc9f155a05f26a2b9c2ce07b129678fd74add20ed4a125bfe0e960f904bb87b/contract';
import startContract from '../../snapshots/7cc9f155a05f26a2b9c2ce07b129678fd74add20ed4a125bfe0e960f904bb87b/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c21a22693dde14a01e1bd49e117e929e08b8003d36943c2b02a578478512b9a9/contract';
import endContract from '../../snapshots/c21a22693dde14a01e1bd49e117e929e08b8003d36943c2b02a578478512b9a9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'v4_user',
        constraint: 'v4_user_username_key',
      }),
      this.dropColumn({ schema: 'public', table: 'v4_user', column: 'username' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
