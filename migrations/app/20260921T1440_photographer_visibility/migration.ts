#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c0dabf842d3a0541149e725dc9a9800a004cc1134cc80a11a9b69d9b16daeca7/contract';
import endContract from '../../snapshots/c0dabf842d3a0541149e725dc9a9800a004cc1134cc80a11a9b69d9b16daeca7/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d6f30891530f400ca13db1b914b6dc5611f93e5f07255e492aefb7dbd549c7da/contract';
import startContract from '../../snapshots/d6f30891530f400ca13db1b914b6dc5611f93e5f07255e492aefb7dbd549c7da/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'v4_photographer',
        column: col('visibility', '"v4_album_visibility"', {
          notNull: true,
          default: lit('public'),
          codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_album_visibility' } },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
