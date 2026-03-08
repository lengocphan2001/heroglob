import { api } from './client';

export type TreeNode = {
  wallet: string;
  name?: string | null;
  level: number;
  joinedAt?: string | null;
  children: TreeNode[];
};

export function getReferralTree(walletAddress: string): Promise<TreeNode> {
  return api<TreeNode>('referrals/tree', {
    params: { walletAddress: walletAddress.trim() },
  });
}
