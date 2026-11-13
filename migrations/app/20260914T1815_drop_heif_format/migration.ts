#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/aae17251039cc59bcfd4a80334a389c998cb79d9b5eeef8782cf7e8e748f03d9/contract';
import startContract from '../../snapshots/aae17251039cc59bcfd4a80334a389c998cb79d9b5eeef8782cf7e8e748f03d9/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/1d9f68b546fc7e408691da0e12973b0b4b2eabea3dc7edcabc184e0e1f81eaa7/contract';
import endContract from '../../snapshots/1d9f68b546fc7e408691da0e12973b0b4b2eabea3dc7edcabc184e0e1f81eaa7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, rawSql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  // Postgres cannot drop a value from an enum type, so the column moves to a fresh type that is
  // then renamed over the old one. No row holds 'heif': the pipeline never produced it.
  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'v4_media_format_new',
        members: ['jpeg', 'webp', 'avif'],
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'v4_media',
        column: 'format',
        options: {
          qualifiedTargetType: '"public"."v4_media_format_new"',
          formatTypeExpected: 'v4_media_format_new',
          rawTargetTypeForLabel: 'v4_media_format_new',
          using: '"format"::text::"public"."v4_media_format_new"',
        },
      }),
      this.dropNativeEnumType({ schema: 'public', typeName: 'v4_media_format' }),
      rawSql({
        id: 'renameType.v4_media_format_new',
        label: 'Rename enum type "v4_media_format_new" to "v4_media_format"',
        operationClass: 'additive',
        target: {
          id: 'postgres',
          details: { schema: 'public', objectType: 'type', name: 'v4_media_format' },
        },
        precheck: [],
        execute: [
          {
            description: 'rename enum type "v4_media_format_new" to "v4_media_format"',
            sql: 'ALTER TYPE "public"."v4_media_format_new" RENAME TO "v4_media_format"',
            params: [],
          },
        ],
        postcheck: [],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
