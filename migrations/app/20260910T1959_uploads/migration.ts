#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7cc9f155a05f26a2b9c2ce07b129678fd74add20ed4a125bfe0e960f904bb87b/contract';
import endContract from '../../snapshots/7cc9f155a05f26a2b9c2ce07b129678fd74add20ed4a125bfe0e960f904bb87b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a015335828566b81776b520ee0ac05c783aaf5a7f3735de716df603a260ccccc/contract';
import startContract from '../../snapshots/a015335828566b81776b520ee0ac05c783aaf5a7f3735de716df603a260ccccc/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_media_job_status',
        members: ['pending', 'running', 'done', 'failed'],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_media_job',
        columns: [
          col('attempts', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('error', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('finished_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('photo_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('started_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', '"v4_media_job_status"', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_media_job_status' } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_album',
        column: col('thumbnail_is_auto', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'v4_photo',
        column: col('created_by_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_media_job',
        index: 'v4_media_job_photo_id_idx_9cab3b42',
        columns: ['photo_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_media_job',
        index: 'v4_media_job_status_created_at_idx_1bbe8adf',
        columns: ['status', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photo',
        index: 'v4_photo_created_by_id_idx_2b1d9a03',
        columns: ['created_by_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_media_job',
        foreignKey: {
          name: 'v4_media_job_photo_id_fkey',
          columns: ['photo_id'],
          references: { schema: 'public', table: 'v4_photo', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_photo',
        foreignKey: {
          name: 'v4_photo_created_by_id_fkey',
          columns: ['created_by_id'],
          references: { schema: 'public', table: 'v4_user', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
