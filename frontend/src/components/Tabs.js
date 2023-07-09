import { useContext, useMemo, useState } from "react";
import "./Tabs.css";
import Swap from "./Swap/Swap";
import Liquidity_Pools from "./Liquidity_Pools/Liquidity";
import Sale_NFT from "./NFT_Sale/NFT";
import Staking from "./Staking/Staking";
import WalletInfo from "./WalletInfo/Wallet";
import Wallet from "./Connection/WalConnect";

export default function TabBlocks() {
  const [layer, setLayer] = useState(0);
//   const role = useContext(UserRole);

  const tabs = useMemo(() => {
    return [
      { label: 'Swap' },
      { label: 'NFT Sale' },
      { label: 'Liquidity Pools' },
      { label: 'Staking' },
      { label: 'Wallet Info' }]
  }, []);

  return (  
  <div>       
          <Wallet/>
            <br/><br/>
            <div className="content">
              {tabs.map(({ label }, index) => ( <ul key={label} className={`${layer === index ? "act" : ""}`} onClick={() => setLayer(index)}>{label}</ul>))}            
            </div>

            

          <div>
            {layer === 0 && <Swap/>}
            {layer === 1 && <Sale_NFT/>}
            {layer === 2 && <Liquidity_Pools/>}
            {layer === 3 && <Staking/>}
            {layer === 4 && <WalletInfo/>}
 
          </div>
  </div> 
  );

}