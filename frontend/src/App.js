import React ,{useState} from 'react';
import TabBlocks from "./components/Tabs";
import './Css/App.css';
import { useWeb3React } from './hooks/UseWeb3React';
import { Updater } from './components/EventListener/EventListener';

export const PendingTransaction = React.createContext({});

export default function App() {

  const addTransaction = (payload) => {
    const { chainId, hash, data, account } = payload;

    const chainTransactions = transactions[chainId] || {};
    const accountTransactions = chainTransactions[account] || {};

    const newTransactions = {
      ...transactions,
      [chainId]: {
        ...chainTransactions,
        [account]: {
          ...accountTransactions,
          [hash]: { data },
        },
      },
    };

    localStorage.setItem(
      "PendingTransaction",
      JSON.stringify(newTransactions)
    );

    setTransactions(newTransactions);
  }

  const removeTransaction = (payload) => {
    const { chainId, hash, account } = payload;

    const chainTransactions = transactions[chainId] || {};
    const accountTransactions = chainTransactions[account] || {};

    delete accountTransactions[hash];

    const newTransactions = {
      ...transactions,
      [chainId]: {
        ...chainTransactions,
        [account]: accountTransactions,
      },
    };

    localStorage.setItem(
      "PendingTransaction",
      JSON.stringify(newTransactions)
    );

    setTransactions(newTransactions);
  }


  const [transactions, setTransactions] = useState({ transactions: JSON.parse(localStorage.getItem("PendingTransaction") || "{}") });
  return (
    <div>
        <PendingTransaction.Provider value={{ transactions, addTransaction, finalizeTransaction: removeTransaction }}>
          <Updater />
          <TabBlocks/>
        </PendingTransaction.Provider>

    </div>
  );
}
