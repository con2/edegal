#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/46f1da740c379ddf5cca6eae67ab0939a7c559d26ccc9c3d8dea9a6c5e47811a/contract';
import endContract from '../../snapshots/46f1da740c379ddf5cca6eae67ab0939a7c559d26ccc9c3d8dea9a6c5e47811a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e1a3cbb9c03323dc192deb6c07dc6b46d553e21a4e0faca21a074a747e153efb/contract';
import startContract from '../../snapshots/e1a3cbb9c03323dc192deb6c07dc6b46d553e21a4e0faca21a074a747e153efb/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'v4_photo',
        column: col('media_key_base', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
