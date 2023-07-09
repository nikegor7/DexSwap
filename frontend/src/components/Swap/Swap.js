import './Swap.css';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { ethers, utils } from 'ethers';
import React, {useState, useEffect, useMemo, useContext} from 'react';
import { useWeb3React } from '../../hooks/UseWeb3React';
import { Tokens,Router,Factory , Pair} from '../../hooks/configs';
import { useRouterContract , useLibraryContract, useFactoryContract, useERC20Contract, usePairContract} from '../../hooks/useContract';
import { PendingTransaction } from '../../App';
import { showTxConfirmation } from '../../hooks/utils';


export default function Swap() {

  const { addTransaction } = useContext(PendingTransaction);

  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [selectedToken1, setSelectedToken1] = useState('');
  const [selectedToken2, setSelectedToken2] = useState('');
  const [isApproveSwap, setIsApproveSwap] = useState(false);
  const token1 = useERC20Contract(Tokens[selectedToken1]?.address);
  const token2 = useERC20Contract(Tokens[selectedToken1]?.address);

  const [reserve1, setReserve1] = useState(0);
  const [reserve2, setReserve2] = useState(0);
  
  const {account, chainId} = useWeb3React();
  const router = useRouterContract(Router?.router);
  const library = useLibraryContract(Router?.library);
  const factory = useFactoryContract(Factory?.factory);


  const pairAddress = useMemo(() => {
    if (!library ) return;
    return library.pairFor(
      factory?.address,
      Tokens[selectedToken1]?.address,
      Tokens[selectedToken2]?.address
    );
  }, [library, factory, selectedToken1, selectedToken2]);

  const paiR = usePairContract(pairAddress);


  const handleAmount1Change = (e) => {
    const value = e.target.value;
    setAmount1(value);
    getAmountOut(value);
  };

  const handleAmount2Change = (e) => {
    const value = e.target.value;
    setAmount2(value);
    getAmountIn(value);
  };


  const handleTokenChange_1 = (e) => {
    setSelectedToken1(e.target.value);
  };

  const handleTokenChange_2 = (e) => {
    setSelectedToken2(e.target.value);
  };


  const getAmountOut = async (value) =>{
    if(!library && !account && !paiR  ) return;
    
    if(paiR && library && account && selectedToken1 && selectedToken2 && amount1){
      try{
        const [_reserveA, _reserveB, ] = await paiR.getReserves();

    const balDecimals = await paiR.decimals();
    if(_reserveA && _reserveB){
        setReserve1((_reserveA/(10**balDecimals)).toFixed(2));
        setReserve2((_reserveB/(10**balDecimals)).toFixed(2));}

            console.log("Res1 bal",  (_reserveA/(10**balDecimals)).toFixed(2));
            console.log("Res2 bal",  (_reserveB/(10**balDecimals)).toFixed(2));


    const amounts = await library.getAmountOut
      (
        value,
        parseFloat(_reserveA/(10**balDecimals)).toFixed(),
        parseFloat(_reserveB/(10**balDecimals)).toFixed()
      );

      setAmount2(parseFloat(amounts).toFixed(0));
    }      catch (error) {
      console.log(error);
    }
  }
  };


  const getAmountIn = async (value) =>{
    if(!library && !account && !paiR && !selectedToken1 && !selectedToken2) return;
    
    if(paiR && library && account && selectedToken1 && selectedToken2 && amount2){
      try{
    const [_reserveA, _reserveB, ] = await paiR.getReserves();

    const balDecimals = await paiR.decimals();
    if(_reserveA && _reserveB){
      setReserve1((_reserveA/(10**balDecimals)).toFixed(2));
      setReserve2((_reserveB/(10**balDecimals)).toFixed(2));}

      console.log("Res1 bal",  (_reserveA/(10**balDecimals)).toFixed(2));
      console.log("Res2 bal",  (_reserveB/(10**balDecimals)).toFixed(2));

    const amount = await library.getAmountIn
      (
        value,
        parseFloat(_reserveA/(10**balDecimals)).toFixed(),
        parseFloat(_reserveB/(10**balDecimals)).toFixed()
      );
      setAmount1(parseFloat(amount).toFixed(0)); 
    }      catch (error) {
      console.log(error);
    }
  }
  };

  const approveSwapExact = async () =>{
    if(!token1 && !token2 && !account && !selectedToken1 && !selectedToken2) return;
    
    // let pairAddress = await library.pairFor
    // (
    //   factory.address,
    //   Tokens[selectedToken1]?.address,
    //   Tokens[selectedToken2]?.address,
    // );

    const _token1 = await token1.approve(paiR.address, utils.parseUnits(amount1, 18));

    showTxConfirmation();
    addTransaction({ chainId, hash: _token1.hash, _token1, account });
    setIsApproveSwap(true);
  };



  const SwapExactTokensForTokens = async () =>{
      const swap = await router.swapExactTokensForTokens
        (
          utils.parseUnits(amount1,18),
          utils.parseUnits('1',18),
          [
            Tokens[selectedToken1]?.address,
            Tokens[selectedToken2]?.address
          ],
          account
        ) 
  };


  return (
    <div className='swap'>
              <div className='block1'>
                <input className='input1' onChange={handleAmount1Change} value={amount1}  placeholder='0' required/>
                  <select className='sel' value={selectedToken1} onChange={handleTokenChange_1}>
                  <option value="">Token</option>
                    {Object.keys(Tokens).map((key) => (
                    <option className={ `${key === selectedToken2 ? 'disabled' : ''}`} key={key} value={key} disabled={key === selectedToken2}>
                    {key}
                    </option>
                    ))}
                  </select>
              </div>
              

              <div className='block1'>
                <input className='input1' onChange={handleAmount2Change} value={amount2} placeholder="0" required/>
                <select className='sel' value={selectedToken2} onChange={handleTokenChange_2}>
                <option value="">Token</option>
                  {Object.keys(Tokens).map((key) => (
                  <option className={ `${key === selectedToken1 ? 'disabled' : ''}`} key={key} value={key} disabled={key === selectedToken1}>
                  {key}
                  </option>
                  ))}
                </select>
              </div>


              { !isApproveSwap ? ( <button className='but' onClick={approveSwapExact}>Approve tokens</button> ) :
              (<button type="submit" className='but' onClick={SwapExactTokensForTokens}>Обменять Токены</button> )}
 
          
    </div>
  );
}