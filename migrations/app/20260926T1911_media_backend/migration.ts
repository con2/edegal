#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/10a95046bdeb172460e489936e4b116a2b7d0c8596c21e833c1b88aefc7776ac/contract';
import startContract from '../../snapshots/10a95046bdeb172460e489936e4b116a2b7d0c8596c21e833c1b88aefc7776ac/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ada10a727c518d291261ba2ddf9d1f259ff3b16f20ea1c4bf6bbba5584818696/contract';
import endContract from '../../snapshots/ada10a727c518d291261ba2ddf9d1f259ff3b16f20ea1c4bf6bbba5584818696/contract.json' with { type: 'json' };
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
