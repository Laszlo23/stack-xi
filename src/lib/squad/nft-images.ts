/** Canonical founding squad NFT art on 4everland / IPFS bucket. */
export const SQUAD_NFT_IMAGE_BASE = "https://nftpepesoccer.4everbucket.com";

/** Player IDs with confirmed artwork on the bucket. */
export const SQUAD_NFT_IMAGE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export function squadPlayerImageUrl(playerId: number): string {
  return `${SQUAD_NFT_IMAGE_BASE}/player-${playerId}.jpg`;
}

export function squadPlayerImageUrlOrFallback(playerId: number): string {
  if (playerId >= 1 && playerId <= 11) {
    return squadPlayerImageUrl(playerId);
  }
  return squadPlayerImageUrl(1);
}
