#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3ec1af1ead9090828f9dce8167ba5010b8eb55e22d40c6e099ff592f28cbcb73/contract';
import endContract from '../../snapshots/3ec1af1ead9090828f9dce8167ba5010b8eb55e22d40c6e099ff592f28cbcb73/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d39467c6b8b2db2922473ea4cc7236c2b9601b57504daecedd255ef6be8d303a/contract';
import startContract from '../../snapshots/d39467c6b8b2db2922473ea4cc7236c2b9601b57504daecedd255ef6be8d303a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_album_layout',
        members: ['simple', 'yearly'],
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_album',
        column: col('layout', '"v4_album_layout"', {
          notNull: true,
          default: lit('simple'),
          codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_album_layout' } },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
