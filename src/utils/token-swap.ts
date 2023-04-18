import poolData from '../token-swap/pools.json';

export const getPoolByTokens = (tokenA: string, tokenB: string) =>
  poolData.pools.find(
    (pool) =>
      (pool.tokenAMint === tokenA && pool.tokenBMint === tokenB) ||
      (pool.tokenAMint === tokenB && pool.tokenBMint === tokenA)
  );
