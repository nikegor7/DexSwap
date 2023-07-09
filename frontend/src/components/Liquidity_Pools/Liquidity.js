import './Liquidity.css';
import { ethers, utils } from 'ethers';
import React, {useState, useEffect, useMemo, useContext} from 'react';
import { useWeb3React } from '../../hooks/UseWeb3React';
import { Tokens,Router,Factory , Pair, NFT_token, NFT_Sale} from '../../hooks/configs';
import { useRouterContract , useLibraryContract, useFactoryContract, useERC20Contract, usePairContract, useNFT_tokenContract} from '../../hooks/useContract';
import { useNFT_SaleContract } from '../../hooks/useContract';
import { PendingTransaction } from '../../App';
import { showTxConfirmation } from '../../hooks/utils';

export default function Liquidity_Pools() {

  const { addTransaction } = useContext(PendingTransaction);

  const [selectedTokenA, setSelectedTokenA] = useState('');
  const tokenA = useERC20Contract(Tokens[selectedTokenA]?.address);
  const [selectedTokenB, setSelectedTokenB] = useState('');
  const tokenB = useERC20Contract(Tokens[selectedTokenB]?.address);

  const par = undefined
  const Pairs = usePairContract(Pair["Pair1"]?.address);
  
  const {account, chainId} = useWeb3React();
  const router = useRouterContract(Router.router);
  const library = useLibraryContract(Router.library);
  const factory = useFactoryContract(Factory.factory);
  const Nft = useNFT_SaleContract(NFT_Sale?.Sale);
  const [hasNFT, setHasNFT] = useState(false);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [liquidity, setLiquidity]= useState(0);
  const [liquidityBal, setLiquidityBal]= useState(0);
  const [eachliquidity, setEachLiquidity] = useState(0);
  const [symbol, setSymbol]= useState("");
  const [reserveA, setReserveA] = useState(0);
  const [reserveB, setReserveB] = useState(0);

  const [isApproved, setIsApproved] = useState(false);
  const [isApprovedRemove, setIsApprovedRemove] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);


  const pairAddress = useMemo(() => {
    if (!library) return;
    return library.pairFor(
      factory.address,
      Tokens[selectedTokenA]?.address,
      Tokens[selectedTokenB]?.address
    );
  }, [library, factory, selectedTokenA, selectedTokenB]);

  const pair = usePairContract(pairAddress);


  useEffect(() => {
    FetchBalance();
    fetchReservesAndAmountOut();
    fetchNFT();
  }, [symbol,reserveA,reserveB, amountA, amountB, library, pair, account,eachliquidity]);



  const handleTokenChange_A = (e) => {
    setSelectedTokenA(e.target.value);
  };

  const handleTokenChange_B = (e) => {
    setSelectedTokenB(e.target.value);
  };


  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenRemoveModal = () => {
    setIsRemoveModalOpen(true);
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
      setIsRemoveModalOpen(false);
    }
  };

  const FetchBalance = async () => {
    if(!selectedTokenA && !selectedTokenB ) return;
      if(pair && account && selectedTokenA && selectedTokenB){
        try{
          const balance = await pair.balanceOf(account);
          const balDecimals = await pair.decimals();
          const liquidity = balance / (10 ** balDecimals);
          const liquidityBal = balance / (10 ** balDecimals);
          const _symbol = await pair.symbol();
          
          setLiquidityBal(parseFloat(liquidityBal).toFixed(2));
          setLiquidity(parseFloat(liquidity).toFixed(2));
          setSymbol(_symbol);
        } catch (error) {
          console.log(error);
        }
      }
  }

  const fetchNFT = async () =>{
    if(account){
      try{
        const _hasNft = await Nft.hasNFT(account);
        setHasNFT(_hasNft);

      }catch (error){
        console.log(error);
      }
    }
  }

  const fetchReservesAndAmountOut = async () =>{
    if(!selectedTokenA && !selectedTokenB) return;
      if(pair && account && library &&  selectedTokenA && selectedTokenB){
        try{
          let [_reserveA, _reserveB, ] = await pair.getReserves();

        const balDecimals = await pair.decimals();
        
                setReserveA((_reserveA/(10**balDecimals)).toFixed(2));
                setReserveB((_reserveB/(10**balDecimals)).toFixed(2));

        const _amountOut  = await library.quote
        (
          amountA.toString(),
          _reserveA.toString(),
          _reserveB.toString()
        )
          setAmountB(_amountOut.toString());
          // console.log("AmountOut",_amountOut.toString());
      }      catch (error) {
        console.log(error);
      }
    }
  }


  const ApproveAdd = async () => {
    if(!tokenA && !tokenB && !account && !selectedTokenA && !selectedTokenB) return;
    let pairAddress = await library.pairFor
      (
        factory.address,
        Tokens[selectedTokenA]?.address,
        Tokens[selectedTokenB]?.address,
      );

      const tx1 = await tokenA.approve(pairAddress, utils.parseUnits(amountA, 18));
      showTxConfirmation();
      addTransaction({ chainId, hash: tx1.hash, tx1, account });
      tx1.wait();


      const tx2 = await tokenB.approve(pairAddress, utils.parseUnits(amountB, 18));
      showTxConfirmation();
      addTransaction({ chainId, hash: tx2.hash, tx2, account });
      tx2.wait();

        setIsApproved(true);

  }

  const ApproveRemove = async () => {
    
    if(!pair ) return;
      const digits = await pair.decimals();
     const tr =  await pair.approve(pairAddress, utils.parseUnits(liquidity, digits));
    
     showTxConfirmation();
     addTransaction({ chainId, hash: tr.hash, tr, account });
     setIsApprovedRemove(true);
 
  }

  const AddLiquidity = async () =>{
    if(!router && !account && !selectedTokenA && !selectedTokenB) return;
    const digitsA = await tokenA.decimals();
    const digitsB = await tokenB.decimals();

    let [_reserveA, _reserveB, ] = await pair.getReserves()

    const balDecimals = await pair.decimals();
    
    const add = await router.addLiquidity
      (
        Tokens[selectedTokenA]?.address,
        Tokens[selectedTokenB]?.address,
        utils.parseUnits(amountA, digitsA),
        utils.parseUnits(amountB, digitsB),
        utils.parseUnits("1", digitsB),
        utils.parseUnits("1", digitsB),
        account
      );

      showTxConfirmation();
      addTransaction({ chainId, hash: add.hash, add, account });

    setAmountA("");
    setAmountB("");
    setReserveA((_reserveA/(10**balDecimals)).toString());
    setReserveB((_reserveB/(10**balDecimals)).toString());
    setIsApproved(false);
  }

  const RemoveLiquidity = async () => {
    if(!router && !account && !selectedTokenA && !selectedTokenB) return;
    const digits = await pair.decimals();
   const remove = await router.removeLiquidity
    (
      Tokens[selectedTokenA]?.address,
      Tokens[selectedTokenB]?.address,
      utils.parseUnits(liquidity,digits),
      utils.parseUnits("1", digits),
      utils.parseUnits("1", digits),
      account
    );

    showTxConfirmation();
    addTransaction({ chainId, hash: remove.hash, remove, account })
  }


  return (
    <>
    {hasNFT ? (

      <div className='liquidity'>
      <div className='text'>
        Liquidity Pools
        
        <button onClick={handleOpenModal} className='button'>Создать Ликвидность</button>
        {isModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-block">
            
              <div className='blockText'>
              Подсказка: При добавлении ликвидности вы получите токены пула, представляющие вашу позицию. Эти токены автоматически зарабатывают комиссию пропорционально вашей доле в пуле и могут быть погашены в любое время.
              </div>
              
              <div className='blockA'>
                <input className='input' onChange={e => setAmountA(e.target.value)} value={amountA}  placeholder='0' required/>
                  <select className='selectA' value={selectedTokenA} onChange={handleTokenChange_A}>
                  <option value="">Token</option>
                    {Object.keys(Tokens).map((key) => (
                    <option className={ `${key === selectedTokenB ? 'disabled' : ''}`} key={key} value={key} disabled={key === selectedTokenB}>
                    {key}
                    </option>
                    ))}
                  </select>
              </div>
              
              <div className='plus'>
                    +
              </div>

              <div className='blockA'>
                <input className='input' onChange={e => setAmountB(e.target.value)} value={amountB} placeholder="0" required/>
                <select className='selectA' value={selectedTokenB} onChange={handleTokenChange_B}>
                <option value="">Token</option>
                  {Object.keys(Tokens).map((key) => (
                  <option className={ `${key === selectedTokenA ? 'disabled' : ''}`} key={key} value={key} disabled={key === selectedTokenA}>
                  {key}
                  </option>
                  ))}
                </select>
              </div>
              { selectedTokenA && selectedTokenB && (
              <div className="blockB">
                  Reserves: {reserveA}/{reserveB}  LP: {eachliquidity} {symbol} 
              </div>   )}

              { !isApproved ? ( <button className='buttonAdd' onClick={ApproveAdd}>Approve tokens</button> ) :
              (<button type="submit" className='buttonAdd' onClick={AddLiquidity}>Создать Ликвидность</button>)}
 
          </div>
        </div>
      )}



        <button className='button' onClick={handleOpenRemoveModal}>Удалить Ликвидность</button>
        {isRemoveModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-block">
          <div className='blockText'>
            Подсказка: При удалении ликвидности вы получите обратные токены пула , представляющие вашу позицию. Эти токены прямо пропорциональны предоставленной раннее ликвидности. Возвращает токены, которые были предоставленны для ликвидности. 
            </div>
            
            <div className='selectRemBlock'> 
              <select className='selectB' value={selectedTokenA} onChange={handleTokenChange_A}>
                <option value="">Token</option>
                {Object.keys(Tokens).map((key) => (
                <option className={ `${key === selectedTokenB ? 'disabled' : ''}`} key={key} value={key} disabled={key === selectedTokenB}>
                {key}
                </option>
                ))}
              </select>

              <select className='selectC' value={selectedTokenB} onChange={handleTokenChange_B}>
                <option value="">Token</option>
                {Object.keys(Tokens).map((key) => (
                <option className={ `${key === selectedTokenA ? 'disabled' : ''}`} key={key} value={key} disabled={key === selectedTokenA}>
                {key}
                </option>
                ))}
              </select>
            </div>

            <div className='blockA'>
              <input className='input' onChange={e => setLiquidity(e.target.value)} value={liquidity} placeholder="0"/>

            </div>
            
            { !isApprovedRemove ? ( <button className='buttonAdd' onClick={ApproveRemove}>Approve tokens</button> ) : 
            (<button className='buttonAdd' onClick={RemoveLiquidity}>Удалить Ликвидность</button>) }

          </div>
        </div>
      )}
      </div>


      <div className="ifexist">
      <div className='scrollable-element'>
      {Object.values(Pair).map(async (pairss) => {
         const liq = await Pairs.balanceOf(account);
          <div className='pairs' key={pairss.address}>
            <text className='text1'>{pairss.name}</text>
            <text className='text2'>{liq} LP Tokens</text>
          </div>
        })}
      </div>
    </div>
    </div>
    ) : (
      <div className='noNFT'><p>Unfortunately, you are not authorized to use the Liquidity Pools. Must purchase at least<b> 1
      Staking Access NFT in NFT Sale block </b> </p>  </div>
      
      )}

</>
  );
}