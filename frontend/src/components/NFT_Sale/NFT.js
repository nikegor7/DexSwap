import './NFT.css';
import { useEffect, useState, useContext } from 'react';
import { NFT_token , NFT_Sale } from '../../hooks/configs';
import { useWeb3React } from '../../hooks/UseWeb3React';
import { useNFT_tokenContract } from '../../hooks/useContract';
import { useNFT_SaleContract } from '../../hooks/useContract';
import { Tokens } from '../../hooks/configs';
import { useERC20Contract } from '../../hooks/useContract';
import { PendingTransaction } from '../../App';
import { showTxConfirmation } from '../../hooks/utils';

export default function Sale_NFT() {

  const { addTransaction } = useContext(PendingTransaction);
  const { account, chainId} = useWeb3React();
  const [nftSymbol, setNFTSymbol] = useState("");
  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState(1);
  const [allowanc, setAllowanc] = useState("");
  const [price, setPrice] = useState("");
  const [remain, setRemain] = useState("");
  const NFT = useNFT_tokenContract(NFT_token?.Token);
  const Sale = useNFT_SaleContract(NFT_Sale?.Sale)
  const usm = useERC20Contract(Tokens['USM']?.address);
  const [nftIds, setNFTIds] = useState([]);
  // let holder ;
 
  useEffect(() => {
    if (!usm && !NFT && !Sale) return;
    Allowance();
    showTokenInfo();

    const showRemainNFT = async () =>{
      const holder = await Sale.nftHolderAddress();
      const _remain = await NFT.balanceOf(holder);
      return _remain.toNumber();
    }
    
    showRemainNFT()
    .then(_remain => setRemain(_remain));
}, [account, allowanc])

const showTokenInfo = async () => {
  if (NFT && Sale){
    try{
      let _balance = await usm.balanceOf(account);
      let _nftSymbol = await NFT.symbol();
      const balDecimals = await usm.decimals();
      setBalance((_balance /= 10 ** balDecimals).toFixed());
      setNFTSymbol(_nftSymbol);
      let _price = await Sale.defaultPrice();
      setPrice(_price /=10**balDecimals);

      // const result = await NFT.getNFTIdsByAccount(account);
      // const nftIdsArray = Object.values(result).map((id) => id.toString());
      // setNFTIds(nftIdsArray);
     
    } catch (error){
      console.log(error);
    }
  }
}



  async function NFTbuy() {
   const buy= await Sale.buyNFT(account, amount, usm.address);
    showTxConfirmation();
    addTransaction({ chainId, hash: buy.hash, buy, account });
  }

  const increment = () => {
    if (amount < 3) {
    setAmount(amount + 1);
    }
  };

  const decrement = () => {
    if (amount > 1) {
      setAmount(amount - 1);
    }
  };

  async function Approve() {
    const price = await Sale.defaultPrice();
    
    const approve = await usm.approve(Sale.treasuryAddress(), (amount*price).toString());

    showTxConfirmation();
    addTransaction({ chainId, hash: approve.hash, approve, account });


  }

  async function Allowance(){
    const allow = await usm.allowance(account, Sale.treasuryAddress());
    setAllowanc(allow);
  }

  return (
    <>
    <div className='nftContainer'>
    <table className="tg">
<thead>
  <tr>
    <th className="tg-0pky" colSpan={6} rowSpan={7}><img className='logo' src="https://static.wikia.nocookie.net/cryptocurrency/images/5/57/Ethereum.jpeg"  width={170} height={200}/>
    <br/> NFT BANK: {remain}
    {/* <br/>       
    <select>
        {nftIds.map((id) => (
          <option key={id}>{id}</option>
        ))}
      </select> */}
    </th>
    <th className="tg-c3ow spec" colSpan={8} >Staking Access NFT</th>
  </tr>
  <tr>
    <th className="pros spec" colSpan={5}>Amount</th>
    <th className="pros spec" colSpan={5}>Balance</th>
  </tr>
  <tr>
    <th className="tg-c3ow" colSpan={4}> 
    <button className='plusminusbutton' onClick={decrement}>-</button> <span className='amount'> {amount} </span>  <button  className='plusminusbutton' onClick={increment}>+</button>
    </th>
    <th className="tg-c3ow" colSpan={5}>USM {balance}</th>
  </tr>
  <tr>
    <th className="tg-c3ow spec" colSpan={8}>Price ${ `${price}` *amount} (USM {`${price}`*amount}.0)</th>
  </tr>
  <tr>
    <th className="tg-c3ow" colSpan={8} rowSpan={2}>
     { 
      allowanc <= 20 ? (<button className='buyButton' onClick={Approve}>Approve tokens</button>) :
      (<button className='buyButton' onClick={NFTbuy}>BUY {nftSymbol}</button>) }
       </th>
  </tr>
</thead>
<tbody>
  <tr>
    <td className="tg-y7gf" colSpan={13}>Description:</td>
  </tr>
  <tr>
  <td className='description' colSpan={13}>This NFT token allows to Mint LP tokens for Staking in Staking Pools</td>
  </tr>
</tbody>
</table>
</div>
    </>
  );
}