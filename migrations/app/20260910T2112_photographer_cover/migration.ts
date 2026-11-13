#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2c694046de43cee475c8802b19d3966ef3418d5626933074fef81a32b5730761/contract';
import startContract from '../../snapshots/2c694046de43cee475c8802b19d3966ef3418d5626933074fef81a32b5730761/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/fab06dda1c3cf6b078e7b96b76f6cf2d41fd91f3599883bb7b3d66aee94daf39/contract';
import endContract from '../../snapshots/fab06dda1c3cf6b078e7b96b76f6cf2d41fd91f3599883bb7b3d66aee94daf39/contract.json' with { type: 'json' };
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
