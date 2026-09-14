#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/64abb5f2b17cb94bf934760d475dc42e181d98e2fb35d8abb95bbd4415a99f3c/contract';
import startContract from '../../snapshots/64abb5f2b17cb94bf934760d475dc42e181d98e2fb35d8abb95bbd4415a99f3c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a5530b9d5eeab959b0d06b49d4bda139a14c6c32f2eebc93e4d6a1ffc3988030/contract';
import endContract from '../../snapshots/a5530b9d5eeab959b0d06b49d4bda139a14c6c32f2eebc93e4d6a1ffc3988030/contract.json' with { type: 'json' };
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
