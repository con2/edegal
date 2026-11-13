#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/e9777e272d70a58613c1d5b841e085f5d6065a7d8c888b3fae1e2604a5cab879/contract';
import endContract from '../../snapshots/e9777e272d70a58613c1d5b841e085f5d6065a7d8c888b3fae1e2604a5cab879/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7e97c7ca84c13d244f0fa290aa9f366e02904a78d7bda998c9145523c74bc99d/contract';
import startContract from '../../snapshots/7e97c7ca84c13d244f0fa290aa9f366e02904a78d7bda998c9145523c74bc99d/contract.json' with { type: 'json' };
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
