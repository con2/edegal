#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7f0a5ddd20892b99e86e24170014e586d084661e2a905b46d9fc5fdf3603aa84/contract';
import endContract from '../../snapshots/7f0a5ddd20892b99e86e24170014e586d084661e2a905b46d9fc5fdf3603aa84/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_album_visibility',
        members: ['public', 'hidden', 'private'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_media_format',
        members: ['jpeg', 'webp', 'avif', 'heif'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_media_role',
        members: ['original', 'preview', 'thumbnail'],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_album',
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
          col('event_date', 'date', {
            notNull: true,
            default: fn('current_date'),
            codecRef: { codecId: 'pg/date-string@1' },
          }),
          col('event_metadata_url', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('uuidv7()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('is_downloadable', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('is_open_for_subalbums', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('ordering', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('owner_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('parent_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('thumbnail_photo_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
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
      this.createTable({
        schema: 'public',
        table: 'v4_album_credit',
        columns: [
          col('album_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('description', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('is_copyright', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('ordering', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('photographer_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['album_id', 'photographer_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_media',
        columns: [
          col('byte_size', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('format', '"v4_media_format"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_media_format' } },
          }),
          col('height', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('uuidv7()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('photo_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', '"v4_media_role"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'v4_media_role' } },
          }),
          col('storage_key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('width', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_photo',
        columns: [
          col('album_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('uuidv7()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('ordering', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('taken_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('title', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_photographer',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('display_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('uuidv7()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('introduction', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_photographer_link',
        columns: [
          col('href', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('uuidv7()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('ordering', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('photographer_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'v4_user',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('display_name', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('email', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('uuidv7()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('sub', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('username', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_album',
        constraint: 'v4_album_path_key',
        columns: ['path'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_album',
        constraint: 'v4_album_parent_id_slug_key',
        columns: ['parent_id', 'slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_media',
        constraint: 'v4_media_storage_key_key',
        columns: ['storage_key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_media',
        constraint: 'v4_media_photo_id_role_format_key',
        columns: ['photo_id', 'role', 'format'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_photo',
        constraint: 'v4_photo_path_key',
        columns: ['path'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_photo',
        constraint: 'v4_photo_album_id_slug_key',
        columns: ['album_id', 'slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_photographer',
        constraint: 'v4_photographer_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_photographer',
        constraint: 'v4_photographer_user_id_key',
        columns: ['user_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_user',
        constraint: 'v4_user_sub_key',
        columns: ['sub'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'v4_user',
        constraint: 'v4_user_username_key',
        columns: ['username'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album',
        index: 'v4_album_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album',
        index: 'v4_album_parent_id_idx_ab33b399',
        columns: ['parent_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album',
        index: 'v4_album_parent_id_ordering_event_date_idx_eb9f7c25',
        columns: ['parent_id', 'ordering', 'event_date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album',
        index: 'v4_album_thumbnail_photo_id_idx_a792ea2c',
        columns: ['thumbnail_photo_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album_credit',
        index: 'v4_album_credit_album_id_idx_de2911bb',
        columns: ['album_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_album_credit',
        index: 'v4_album_credit_photographer_id_idx_21cd8253',
        columns: ['photographer_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_media',
        index: 'v4_media_photo_id_idx_9cab3b42',
        columns: ['photo_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photo',
        index: 'v4_photo_album_id_idx_de2911bb',
        columns: ['album_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photo',
        index: 'v4_photo_album_id_ordering_taken_at_slug_idx_af6850ee',
        columns: ['album_id', 'ordering', 'taken_at', 'slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photographer_link',
        index: 'v4_photographer_link_photographer_id_idx_21cd8253',
        columns: ['photographer_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'v4_photographer_link',
        index: 'v4_photographer_link_photographer_id_ordering_idx_5c09c2bd',
        columns: ['photographer_id', 'ordering'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album',
        foreignKey: {
          name: 'v4_album_parent_id_fkey',
          columns: ['parent_id'],
          references: { schema: 'public', table: 'v4_album', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album',
        foreignKey: {
          name: 'v4_album_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'v4_user', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album',
        foreignKey: {
          name: 'v4_album_thumbnail_photo_id_fkey',
          columns: ['thumbnail_photo_id'],
          references: { schema: 'public', table: 'v4_photo', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album_credit',
        foreignKey: {
          name: 'v4_album_credit_album_id_fkey',
          columns: ['album_id'],
          references: { schema: 'public', table: 'v4_album', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_album_credit',
        foreignKey: {
          name: 'v4_album_credit_photographer_id_fkey',
          columns: ['photographer_id'],
          references: { schema: 'public', table: 'v4_photographer', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_media',
        foreignKey: {
          name: 'v4_media_photo_id_fkey',
          columns: ['photo_id'],
          references: { schema: 'public', table: 'v4_photo', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_photo',
        foreignKey: {
          name: 'v4_photo_album_id_fkey',
          columns: ['album_id'],
          references: { schema: 'public', table: 'v4_album', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_photographer',
        foreignKey: {
          name: 'v4_photographer_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'v4_user', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'v4_photographer_link',
        foreignKey: {
          name: 'v4_photographer_link_photographer_id_fkey',
          columns: ['photographer_id'],
          references: { schema: 'public', table: 'v4_photographer', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
