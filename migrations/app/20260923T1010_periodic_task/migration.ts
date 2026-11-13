#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a86379f4e978ea12510d5769e6740e7d51c9b0b68f2163719dc7e502f72e888f/contract';
import endContract from '../../snapshots/a86379f4e978ea12510d5769e6740e7d51c9b0b68f2163719dc7e502f72e888f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c0dabf842d3a0541149e725dc9a9800a004cc1134cc80a11a9b69d9b16daeca7/contract';
import startContract from '../../snapshots/c0dabf842d3a0541149e725dc9a9800a004cc1134cc80a11a9b69d9b16daeca7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'v4_periodic_task',
        columns: [
          col('claimed_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('last_success_claimed_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['name'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
