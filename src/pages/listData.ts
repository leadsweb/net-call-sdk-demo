import type { Key } from 'react';

interface DataType {
  key: Key;
  /** 线索id */
  leadsId: number;
  /** 广告主账号id */
  accountId: number;
  /** 客服id */
  user_id: number;
  /** 线索号码 */
  callee_number: number;
  /** 线索用户姓名 */
  callee_name: string;
}

export const listData: DataType[] = [
  {
    key: '0',
    leadsId: 218001014,
    accountId: 20458,
    user_id: 321,
    callee_number: 13810433402,
    callee_name: 'colin',
  },
  {
    key: '1',
    leadsId: 217998358,
    accountId: 20458,
    user_id: 123456,
    callee_number: 13811892894,
    callee_name: 'lucia',
  },
  {
    key: '2',
    leadsId: 217818272,
    accountId: 20458,
    user_id: 20458,
    callee_number: 13193334813,
    callee_name: 'haiqing',
  },
  {
    key: '3',
    leadsId: 217997425,
    accountId: 20458,
    user_id: 20458,
    callee_number: 13161354813,
    callee_name: 'haiqing2',
  },
  {
    key: '4',
    leadsId: 11751470,
    accountId: 20458,
    user_id: 123,
    callee_number: 13693002106,
    callee_name: 'guiyang',
  },
  {
    key: '5',
    leadsId: 217822085,
    accountId: 20458,
    user_id: 54321,
    callee_number: 15923371929,
    callee_name: 'arc',
  },
];
