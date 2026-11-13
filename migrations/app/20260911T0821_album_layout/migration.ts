#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/ab476b77d70fe1e9b186833a70e4ec5b5d2380632136dbc0e889c0cb9ccdb02c/contract';
import endContract from '../../snapshots/ab476b77d70fe1e9b186833a70e4ec5b5d2380632136dbc0e889c0cb9ccdb02c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fab06dda1c3cf6b078e7b96b76f6cf2d41fd91f3599883bb7b3d66aee94daf39/contract';
import startContract from '../../snapshots/fab06dda1c3cf6b078e7b96b76f6cf2d41fd91f3599883bb7b3d66aee94daf39/contract.json' with { type: 'json' };
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
