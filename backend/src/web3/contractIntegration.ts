import { Contract, Keypair, Networks, rpc } from "@stellar/stellar-sdk";

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const getContractIntegration = async () => {
  const rpcServer = new rpc.Server(requireEnv("RPC_URL"));
  const signer = Keypair.fromSecret(requireEnv("PRIVATE_KEY"));
  const sourceAccount = await rpcServer.getAccount(signer.publicKey());

  const contractIds = {
    contentRegistry: requireEnv("CONTRACT_ADDRESS_CONTENTREGISTRY"),
    contentNft: requireEnv("CONTRACT_ADDRESS_CONTENTNFT"),
    paymentEscrow: requireEnv("CONTRACT_ADDRESS_PAYMENTESCROW"),
    royaltyManager: requireEnv("CONTRACT_ADDRESS_ROYALTYMANAGER"),
  };

  return {
    rpcServer,
    signer,
    sourceAccount,
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
    contractIds,
    contracts: {
      contentRegistry: new Contract(contractIds.contentRegistry),
      contentNft: new Contract(contractIds.contentNft),
      paymentEscrow: new Contract(contractIds.paymentEscrow),
      royaltyManager: new Contract(contractIds.royaltyManager),
    },
  };
};
