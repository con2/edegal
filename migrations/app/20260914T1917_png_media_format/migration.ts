#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/a5530b9d5eeab959b0d06b49d4bda139a14c6c32f2eebc93e4d6a1ffc3988030/contract';
import startContract from '../../snapshots/a5530b9d5eeab959b0d06b49d4bda139a14c6c32f2eebc93e4d6a1ffc3988030/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e1a3cbb9c03323dc192deb6c07dc6b46d553e21a4e0faca21a074a747e153efb/contract';
import endContract from '../../snapshots/e1a3cbb9c03323dc192deb6c07dc6b46d553e21a4e0faca21a074a747e153efb/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addNativeEnumValue({ schema: 'public', typeName: 'v4_media_format', value: 'png' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
