#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/3ec1af1ead9090828f9dce8167ba5010b8eb55e22d40c6e099ff592f28cbcb73/contract';
import startContract from '../../snapshots/3ec1af1ead9090828f9dce8167ba5010b8eb55e22d40c6e099ff592f28cbcb73/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/64abb5f2b17cb94bf934760d475dc42e181d98e2fb35d8abb95bbd4415a99f3c/contract';
import endContract from '../../snapshots/64abb5f2b17cb94bf934760d475dc42e181d98e2fb35d8abb95bbd4415a99f3c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'v4_redirect',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('from_path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('to_path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['from_path'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_series',
        columns: [
          col('body', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('visibility', '"v4_album_visibility"', {
            notNull: true,
            default: lit('public'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_album_visibility' } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_album',
        column: col('redirect_url', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_album',
        column: col('series_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_series',
        constraint: 'v4_series_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_series',
        constraint: 'v4_series_path_key',
        columns: ['path'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album',
        index: 'v4_album_series_id_idx_57e32972',
        columns: ['series_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_redirect',
        index: 'v4_redirect_to_path_idx_371e6735',
        columns: ['to_path'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album',
        foreignKey: {
          name: 'v4_album_series_id_fkey',
          columns: ['series_id'],
          references: { schema: 'public', table: 'v4_series', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
