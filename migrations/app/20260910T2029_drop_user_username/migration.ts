#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/11b9f379046f48c4044041c5680a6323c730c961fba2c81874370443cbb4e27d/contract';
import startContract from '../../snapshots/11b9f379046f48c4044041c5680a6323c730c961fba2c81874370443cbb4e27d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/2c694046de43cee475c8802b19d3966ef3418d5626933074fef81a32b5730761/contract';
import endContract from '../../snapshots/2c694046de43cee475c8802b19d3966ef3418d5626933074fef81a32b5730761/contract.json' with { type: 'json' };
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
