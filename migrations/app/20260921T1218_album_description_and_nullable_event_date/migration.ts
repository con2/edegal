#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/e9777e272d70a58613c1d5b841e085f5d6065a7d8c888b3fae1e2604a5cab879/contract';
import startContract from '../../snapshots/e9777e272d70a58613c1d5b841e085f5d6065a7d8c888b3fae1e2604a5cab879/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d6f30891530f400ca13db1b914b6dc5611f93e5f07255e492aefb7dbd549c7da/contract';
import endContract from '../../snapshots/d6f30891530f400ca13db1b914b6dc5611f93e5f07255e492aefb7dbd549c7da/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'v4_album',
        column: col('description', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.dropNotNull({ schema: 'public', table: 'v4_album', column: 'event_date' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
