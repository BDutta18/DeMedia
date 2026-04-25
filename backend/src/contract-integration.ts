import { uploadContentToBlockchain } from "./web3/uploadContent";
import { mintNFT } from "./utils/mintNFT";
import { buyNFT } from "./web3/buyNFT";
import { getContractIntegration } from "./web3/contractIntegration";

export const CONTRACT_ENV_KEYS = [
  "RPC_URL",
  "PRIVATE_KEY",
  "CONTRACT_ADDRESS_CONTENTREGISTRY",
  "CONTRACT_ADDRESS_CONTENTNFT",
  "CONTRACT_ADDRESS_PAYMENTESCROW",
  "CONTRACT_ADDRESS_ROYALTYMANAGER",
] as const;

export interface ContractAddressMap {
  contentRegistry: string;
  contentNft: string;
  paymentEscrow: string;
  royaltyManager: string;
}

export interface BuyNftParams {
  tokenId: number;
  priceInXLM: string;
  buyerAddress: string;
  sellerAddress: string;
}

const getMissingEnvKeys = (): string[] =>
  CONTRACT_ENV_KEYS.filter((key) => !process.env[key]);

export const getConfiguredContractAddresses = (): ContractAddressMap => {
  const missing = getMissingEnvKeys();
  if (missing.length > 0) {
    throw new Error(`Missing required contract integration env vars: ${missing.join(", ")}`);
  }

  return {
    contentRegistry: process.env.CONTRACT_ADDRESS_CONTENTREGISTRY!,
    contentNft: process.env.CONTRACT_ADDRESS_CONTENTNFT!,
    paymentEscrow: process.env.CONTRACT_ADDRESS_PAYMENTESCROW!,
    royaltyManager: process.env.CONTRACT_ADDRESS_ROYALTYMANAGER!,
  };
};

export const verifyContractIntegration = async () => {
  const context = await getContractIntegration();
  return {
    ok: true,
    networkPassphrase: context.networkPassphrase,
    sourceAddress: context.signer.publicKey(),
    contractIds: context.contractIds,
  };
};

export const contractIntegration = {
  getContext: getContractIntegration,
  getConfiguredContractAddresses,
  verifyContractIntegration,
  registerContent: uploadContentToBlockchain,
  mintContentNft: mintNFT,
  buyNftWithRoyalty: (params: BuyNftParams) => buyNFT(params),
};
