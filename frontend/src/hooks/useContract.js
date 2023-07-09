import { Contract } from "ethers";
import { useMemo } from "react";
import { useWeb3React } from "./UseWeb3React";
import NFT_token from "../contracts_abis/NFT_Token.json"
import NFT_Sale from "../contracts_abis/NFT_Sale.json"
import Token from "../contracts_abis/Token.json";
import ZuniswapV2Factory from "../contracts_abis/Factory.json";
import ZuniswapV2Library from "../contracts_abis/Library.json";
import ZuniswapV2Router from "../contracts_abis/Router.json";
import ZuniswapV2Pair from "../contracts_abis/Pair.json";
export const useContract = (address, ABI) => {
  const { library, account, chainId } = useWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !chainId) return null;

    try {
      return new Contract(
        address,
        ABI.abi || ABI,
        getProviderOrSigner(library, account)
      );
    } catch (error) {
      return null;
    }
  }, [address, ABI, library, chainId, account]);
};

const getProviderOrSigner = (library, account) => {
  return account ? library?.getSigner(account).connectUnchecked() : library;
};

export const useNFT_tokenContract = (NFT_tokenAddress) => { return useContract(NFT_tokenAddress, NFT_token.abi) }
export const useNFT_SaleContract = (NFT_SaleAddress) => { return useContract(NFT_SaleAddress, NFT_Sale.abi) }
export const useERC20Contract = (ERC20_address) => {return useContract(ERC20_address, Token.abi)}
export const useFactoryContract = (FactoryAddress) => {return useContract(FactoryAddress, ZuniswapV2Factory.abi)}
export const useLibraryContract = (LibraryAddress) => {return useContract(LibraryAddress, ZuniswapV2Library.abi)}
export const useRouterContract = (RouterAddress) => {return useContract(RouterAddress, ZuniswapV2Router.abi)}
export const usePairContract = (PairAddress) => {return useContract(PairAddress, ZuniswapV2Pair.abi)}