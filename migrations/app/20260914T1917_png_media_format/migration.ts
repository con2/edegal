#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1d9f68b546fc7e408691da0e12973b0b4b2eabea3dc7edcabc184e0e1f81eaa7/contract';
import startContract from '../../snapshots/1d9f68b546fc7e408691da0e12973b0b4b2eabea3dc7edcabc184e0e1f81eaa7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7e97c7ca84c13d244f0fa290aa9f366e02904a78d7bda998c9145523c74bc99d/contract';
import endContract from '../../snapshots/7e97c7ca84c13d244f0fa290aa9f366e02904a78d7bda998c9145523c74bc99d/contract.json' with { type: 'json' };
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
