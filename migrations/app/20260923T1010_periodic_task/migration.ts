#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/10a95046bdeb172460e489936e4b116a2b7d0c8596c21e833c1b88aefc7776ac/contract';
import endContract from '../../snapshots/10a95046bdeb172460e489936e4b116a2b7d0c8596c21e833c1b88aefc7776ac/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/44db22cdc23509007d7c9368db8df7d3390616977a72b7a56e335f9b75804982/contract';
import startContract from '../../snapshots/44db22cdc23509007d7c9368db8df7d3390616977a72b7a56e335f9b75804982/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'v4_periodic_task',
        columns: [
          col('claimed_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('last_success_claimed_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['name'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
