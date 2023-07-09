import { useCallback, useEffect, useMemo, useContext } from "react";
// import { useWeb3React } from "../../Configs/use-web3-react";
import { useWeb3React } from "../../hooks/UseWeb3React";
// import { PendingTransaction } from "../../App";
import { PendingTransaction } from "../../App";
import Swal from "sweetalert2";

let timer = null ;

export const Updater = () => {
  const { chainId, library, account } = useWeb3React();

  const { transactions, finalizeTransaction } =
    useContext(PendingTransaction);
  console.log("transaction", transactions);

  const data = useMemo(
    () => transactions[chainId]?.[account ] || {},
    [transactions, chainId, account]
  );

  const fetchData = useCallback(async () => {
    Object.keys(data).forEach(async (hash) => {
      try {
        const {
          summary,
          actionCallback,
          actionCallbackParams,
          title = "Success",
        } = data[hash];
        const receipt = await library?.getTransactionReceipt(hash);

        if (receipt?.status === 1) {
          Swal.fire({
            text: "Transaction confirmed successfully",
            icon: "success",
            position: "top-end",
            toast: true,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          } );
          finalizeTransaction({
            account,
            chainId,
            hash,
            data: receipt,
          });
          if (actionCallback) {
            finalizeTransaction({
              type: actionCallback,
              payload: actionCallbackParams || {},
            });
          }
        } else if (receipt?.status === 0) {
          Swal.fire({
            text: "Transaction was failed",
            icon: "error",
            position: "top-end",
            toast: true,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          } );

          finalizeTransaction({
            account,
            chainId,
            hash,
            data: receipt,
          });
        }
      } catch (error) {
        Swal.fire({
          text: `Failed to fetch transaction: ${hash}`,
          icon: "error",
          position: "top-end",
          toast: true,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        } );
        console.error(
          `log => failed to check transaction hash: ${hash}`,
          error
        );
      }
    });
  }, [library, data, chainId, finalizeTransaction, account]);

  useEffect(() => {
    if (!chainId || !library) return;

    if (Object.keys(data).length) {
      clearInterval(timer);
      fetchData();
      timer = setInterval(() => fetchData(), 1500);
    }

    return () => {
      clearInterval(timer);
    };
  }, [chainId, library, data, fetchData]);

  return null;
};
