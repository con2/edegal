#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/a015335828566b81776b520ee0ac05c783aaf5a7f3735de716df603a260ccccc/contract';
import endContract from '../../snapshots/a015335828566b81776b520ee0ac05c783aaf5a7f3735de716df603a260ccccc/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d0a2354e1c2720e463061ce98f58d65086782cbe723c3079adc8555a3dc68b04/contract';
import startContract from '../../snapshots/d0a2354e1c2720e463061ce98f58d65086782cbe723c3079adc8555a3dc68b04/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'v4_terms',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('owner_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('text', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('url', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_album',
        column: col('terms_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_photographer',
        column: col('default_terms_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album',
        index: 'v4_album_terms_id_idx_5cf174f1',
        columns: ['terms_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photographer',
        index: 'v4_photographer_default_terms_id_idx_f50d418e',
        columns: ['default_terms_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_terms',
        index: 'v4_terms_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_terms',
        foreignKey: {
          name: 'v4_terms_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'v4_user', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album',
        foreignKey: {
          name: 'v4_album_terms_id_fkey',
          columns: ['terms_id'],
          references: { schema: 'public', table: 'v4_terms', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_photographer',
        foreignKey: {
          name: 'v4_photographer_default_terms_id_fkey',
          columns: ['default_terms_id'],
          references: { schema: 'public', table: 'v4_terms', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
