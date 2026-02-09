import React, { useEffect, useState } from "react";
import TableTransactionStyles from "../styles/TableTransaction.module.css";
import { useFetch } from "../context/FetchContext.js";
import { useWallet } from "../context/WalletContext";
import Popup from "./Popup.component";

function TableWallet({ selectedId, activeWalletTransactions }) {
  const [symbol, setSymbol] = useState("");
  const [maxCount, setMaxCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { walletsLines, actualiseWalletsLines, valuesCached } = useWallet();

  useEffect(() => {
    if (!(walletsLines && walletsLines[selectedId])) actualiseWalletsLines();
  }, [activeWalletTransactions]);

  return (
    <>
      <table className={TableTransactionStyles.transactionTable}>
        <thead>
          <tr className={TableTransactionStyles.tr}>
            <th className={TableTransactionStyles.th}>Libellé</th>
            <th className={TableTransactionStyles.th}>Quantité</th>
            <th className={TableTransactionStyles.th}>Valeur achat</th>
            <th className={TableTransactionStyles.th}>Valeur actuelle</th>
            <th className={TableTransactionStyles.th}>Var $</th>
            <th className={TableTransactionStyles.th}>Var %</th>
            <th className={TableTransactionStyles.th}>Gain</th>
            <th className={TableTransactionStyles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {walletsLines &&
            walletsLines[selectedId] &&
            walletsLines[selectedId].map((item, index) => {
              let value = valuesCached?.[item.symbol]?.value;
              if (value == null) return null;

              let quantityBuy = 0;
              let averagePriceAtExecution = item.valueAtExecution.reduce(
                (acc, item2) => {
                  quantityBuy += item2.quantity;
                  return acc + item2.quantity * item2.price;
                },
                0
              );
              averagePriceAtExecution = averagePriceAtExecution / quantityBuy;

              const variation = value - averagePriceAtExecution;
              const isPositive = variation >= 0;

              return (
                <tr key={index} className={TableTransactionStyles.tr}>
                  <td data-label="Libellé" className={TableTransactionStyles.td} style={{fontWeight: 'bold'}}>
                    {item?.symbol}
                  </td>
                  <td data-label="Quantité" className={TableTransactionStyles.td}>
                    {item?.quantity?.toFixed(2)}
                  </td>
                  <td data-label="Valeur Achat" className={TableTransactionStyles.td}>
                    {averagePriceAtExecution?.toFixed(2)} $
                  </td>
                  <td data-label="Valeur Actuelle" className={TableTransactionStyles.td}>
                    {value?.toFixed(2)} $
                  </td>
                  <td data-label="Var $" className={TableTransactionStyles.td} style={{ color: isPositive ? '#2ecc71' : '#e74c3c' }}>
                    {isPositive ? '+' : ''}{variation.toFixed(2)} $
                  </td>
                  <td data-label="Var %" className={TableTransactionStyles.td} style={{ color: isPositive ? '#2ecc71' : '#e74c3c' }}>
                    {averagePriceAtExecution ? (variation / averagePriceAtExecution * 100).toFixed(2) : "0.00"} %
                  </td>
                  <td data-label="Gain" className={TableTransactionStyles.td} style={{fontWeight: 'bold'}}>
                    {(variation * item.quantity).toFixed(2)} $
                  </td>
                  <td data-label="Action" className={TableTransactionStyles.td}>
                    {/* BOUTON MODIFIÉ ICI */}
                    <button 
                      className={TableTransactionStyles.sellButton}
                      onClick={() => { 
                        setIsOpen(true); 
                        setSymbol(item.symbol); 
                        setMaxCount(item.quantity); 
                      }}
                    >
                      Vendre
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <Popup
        title="Vendre"
        subtitle={`Vendre ${symbol}`}
        sell={true}
        symbol={symbol}
        maxCount={maxCount}
        open={isOpen}
        close={() => setIsOpen(false)}
      />
    </>
  );
}

export default TableWallet;