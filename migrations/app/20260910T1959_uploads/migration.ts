#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/11b9f379046f48c4044041c5680a6323c730c961fba2c81874370443cbb4e27d/contract';
import endContract from '../../snapshots/11b9f379046f48c4044041c5680a6323c730c961fba2c81874370443cbb4e27d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/2e7912e9145a64530edea64e12993e2b6622177da0c4d6886a2d4cbd50381b89/contract';
import startContract from '../../snapshots/2e7912e9145a64530edea64e12993e2b6622177da0c4d6886a2d4cbd50381b89/contract.json' with { type: 'json' };
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
