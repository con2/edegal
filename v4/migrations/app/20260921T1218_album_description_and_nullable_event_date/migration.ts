#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/46f1da740c379ddf5cca6eae67ab0939a7c559d26ccc9c3d8dea9a6c5e47811a/contract';
import startContract from '../../snapshots/46f1da740c379ddf5cca6eae67ab0939a7c559d26ccc9c3d8dea9a6c5e47811a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c65ac39ac33696af0da2fbe396148adb8566a0a95673e176b7bad7d1f586abbf/contract';
import endContract from '../../snapshots/c65ac39ac33696af0da2fbe396148adb8566a0a95673e176b7bad7d1f586abbf/contract.json' with { type: 'json' };
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
