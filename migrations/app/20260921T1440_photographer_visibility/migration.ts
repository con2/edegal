#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/44db22cdc23509007d7c9368db8df7d3390616977a72b7a56e335f9b75804982/contract';
import endContract from '../../snapshots/44db22cdc23509007d7c9368db8df7d3390616977a72b7a56e335f9b75804982/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c65ac39ac33696af0da2fbe396148adb8566a0a95673e176b7bad7d1f586abbf/contract';
import startContract from '../../snapshots/c65ac39ac33696af0da2fbe396148adb8566a0a95673e176b7bad7d1f586abbf/contract.json' with { type: 'json' };
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
