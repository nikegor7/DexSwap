import { useCallback, useEffect, useMemo } from "react";

import {
  walletConnectHooks,
  walletConnect,
  metamask,
  metamaskHooks,
} from "./Providers";

export const useWeb3React = () => {
  const hooks = localStorage.getItem("walletconnect")
    ? walletConnectHooks
    : metamaskHooks;

  const {
    useChainId,
    useAccount,
    useProvider,
    useIsActive,
    useIsActivating,
    useAccounts,
    useError,
  } = hooks;

  const accounts = useAccounts();
  const isActivating = useIsActivating();
  const active = useIsActive();
  const account = useAccount();
  const chainId = useChainId();
  const library = useProvider(undefined);
  const error = useError();

  const activateWalletConnect = useCallback(async () => {
    try {
      await walletConnect.activate(5);
    } catch (e) {
      throw e;
    }
  }, []);

  const activateMetamask = useCallback(async () => {
    try {
      await metamask.activate(5);
      localStorage.setItem("isMetamask", "true");
    } catch (e) {
      throw e;
    }
  }, []);

  const deactivate = useCallback(async () => {
      await metamask.deactivate();
  }, []);

  const data = useMemo(
    () => ({
      account,
      chainId: chainId || 0,
      library,
      activateWalletConnect,
      activateMetamask,
      deactivate,
      active,
      isActivating,
      accounts,
      error,
    }),
    [
      account,
      chainId,
      library,
      activateWalletConnect,
      activateMetamask,
      deactivate,
      active,
      isActivating,
      accounts,
      error,
    ]
  );

  return data;
};

export const Web3ForClassComponent = ({ setWeb3 }) => {
  const web3 = useWeb3React();

  useEffect(() => setWeb3(web3), [web3, setWeb3]);

  return null;
};
