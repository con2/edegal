#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2ca9fe8f536a2ec2867ce2b8f994e9681dd38d7d9a9f3d7556743400b5bf4f4f/contract';
import endContract from '../../snapshots/2ca9fe8f536a2ec2867ce2b8f994e9681dd38d7d9a9f3d7556743400b5bf4f4f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/bc0612466791e1d624d8d9c74b30f5ea5a8af1a096f89fe37aafe843af83ac1c/contract';
import startContract from '../../snapshots/bc0612466791e1d624d8d9c74b30f5ea5a8af1a096f89fe37aafe843af83ac1c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
