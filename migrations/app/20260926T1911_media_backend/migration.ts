#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a86379f4e978ea12510d5769e6740e7d51c9b0b68f2163719dc7e502f72e888f/contract';
import startContract from '../../snapshots/a86379f4e978ea12510d5769e6740e7d51c9b0b68f2163719dc7e502f72e888f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bc0612466791e1d624d8d9c74b30f5ea5a8af1a096f89fe37aafe843af83ac1c/contract';
import endContract from '../../snapshots/bc0612466791e1d624d8d9c74b30f5ea5a8af1a096f89fe37aafe843af83ac1c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_media_backend',
        members: ['fs', 's3'],
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_media',
        column: col('backend', '"v4_media_backend"', {
          notNull: true,
          default: lit('fs'),
          codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_media_backend' } },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
