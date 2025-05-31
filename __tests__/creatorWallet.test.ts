import { strict as assert } from 'node:assert';
import { parseRow } from '../src/lib/sheets';

const sampleRow = [] as any[];
sampleRow[12] = '0xABC';
sampleRow[13] = 'founder.eth';
sampleRow[14] = 'some comment';

const project = parseRow(sampleRow);

assert.equal(project.creatorWallet, '0xABC');
assert.equal(project.creatorENS, 'founder.eth');
assert.equal(project.walletComment, 'some comment');
