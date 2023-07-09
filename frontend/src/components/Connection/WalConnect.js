import React, {useState }from 'react';
import { useWeb3React } from '../../hooks/UseWeb3React';
import './WalConnect.css';
import Swal from 'sweetalert2';


export default function Wallet() {
    const {
        activateMetamask,
        deactivate,
        account,
      } = useWeb3React();

      const [isConnected, setIsConnected] = useState(false);

    
   
      const clickConnect = async () => {
        if (!window.ethereum) {
          const action = await Swal.fire({
            icon: 'error',
            text: "Please install MetaMask!",
            confirmButtonText: 'Install MetaMask',
          })

          if (action.isConfirmed) {
            window.location.href = "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn";
          }

          await disconnect();
          return;
        }
        await activateMetamask();
        setIsConnected(true);
      }
    
      const disconnect = async () => {
        // await deactivate();
        setIsConnected(false);
      };

    return(
      <div className='contain'> 
        {
          !isConnected ?
            (<button onClick={clickConnect}>Connect Wallet</button>) : 
            (<button onClick={disconnect}>Disconnect</button>)
        }
      </div>
      );

}