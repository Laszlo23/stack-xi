export type AccountAssociation = {
  header: string;
  payload: string;
  signature: string;
};

function readEnv(key: string): string {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key]!.trim();
  }
  const viteKey = `VITE_${key}` as keyof ImportMetaEnv;
  const viteValue = import.meta.env?.[viteKey];
  return typeof viteValue === "string" ? viteValue.trim() : "";
}

export function getAccountAssociation(): AccountAssociation {
  return {
    header: readEnv("FARCASTER_ACCOUNT_ASSOCIATION_HEADER"),
    payload: readEnv("FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD"),
    signature: readEnv("FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE"),
  };
}

export function isAccountAssociationConfigured(association: AccountAssociation): boolean {
  return Boolean(association.header && association.payload && association.signature);
}
