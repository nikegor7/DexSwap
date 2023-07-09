import './WalletInfo.css';
import { useWeb3React } from '../../hooks/UseWeb3React';
import { useEffect, useState } from 'react';
import { truncateAddress } from '../../hooks/utils';
import { Tokens , NFT_token} from '../../hooks/configs';
import {  useERC20Contract, useNFT_tokenContract} from '../../hooks/useContract';


export default function WalletInfo() {
  const { account } = useWeb3React();
  const [selectedToken, setSelectedToken] = useState('');
  const token = useERC20Contract(Tokens[selectedToken]?.address);
  const nft = useNFT_tokenContract(NFT_token?.Token);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if(!nft) return;
    fetchBalance();
    nftCounter(account)
    .then(Amount => setAmount(Amount));

  }, [selectedToken, token, balance, account]);

  useEffect(() => {
    if (!selectedToken && account) {
      setSelectedToken('USM');
    }
  }, [selectedToken, account]);

  const handleTokenChange = (e) => {
    setSelectedToken(e.target.value);
  };
  
  const nftCounter = async (account) =>{
    const Amount = await nft.balanceOf(account);
    console.log("amount",Amount.toNumber());
    return Amount.toNumber();
  }

  const fetchBalance = async () => {
    if (selectedToken && token) {
    try {
      let tokenBalance = await token.balanceOf(account);
  const balDecimals = await token.decimals();
  setBalance((tokenBalance /= 10 ** balDecimals).toFixed(2));

    } catch (error) {
      console.log(error);
    }
  };
  
}

 

  return (
    <div className='container'>
      <div className='picture'>
        <img src="https://static.wikia.nocookie.net/cryptocurrency/images/5/57/Ethereum.jpeg"/>  
        <text className='tex1'>Your Address</text> 
        <text className='address'>{truncateAddress(account)}</text>
        <text className='tex2'>Balance</text> 
        <text className='address1'>

        <select className='select' value={selectedToken} onChange={handleTokenChange}>
        {Object.keys(Tokens).map((key) => (
          <option className='option' key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      
        
          {balance}
      
          </text>
      </div>
       <div className='tex3'>
        Amount {amount}
      </div>   
    </div>
  );
}
