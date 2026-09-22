#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/c21a22693dde14a01e1bd49e117e929e08b8003d36943c2b02a578478512b9a9/contract';
import startContract from '../../snapshots/c21a22693dde14a01e1bd49e117e929e08b8003d36943c2b02a578478512b9a9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d39467c6b8b2db2922473ea4cc7236c2b9601b57504daecedd255ef6be8d303a/contract';
import endContract from '../../snapshots/d39467c6b8b2db2922473ea4cc7236c2b9601b57504daecedd255ef6be8d303a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'v4_photographer',
        column: col('cover_photo_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photographer',
        index: 'v4_photographer_cover_photo_id_idx_caa9ddb0',
        columns: ['cover_photo_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_photographer',
        foreignKey: {
          name: 'v4_photographer_cover_photo_id_fkey',
          columns: ['cover_photo_id'],
          references: { schema: 'public', table: 'v4_photo', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
