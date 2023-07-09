import { initializeConnector } from "@web3-react/core";
import { WalletConnect } from "@web3-react/walletconnect";
import { MetaMask } from "@web3-react/metamask";
import * as dotenv from "dotenv";
dotenv.config();

const NETWORK_URLS = {
  5: `https://goerli.infura.io/v3/73329878e17549708755bff6f85cb1f7`,
};

export const [walletConnect, walletConnectHooks] = initializeConnector(
  (actions) =>
    new WalletConnect(actions, {
      rpc: NETWORK_URLS,
    }),
  [5]
);

export const [metamask, metamaskHooks] = initializeConnector(
  (actions) => new MetaMask(actions)
);
