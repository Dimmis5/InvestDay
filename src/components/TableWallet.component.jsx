import React, { useEffect, useState } from "react";
import TableTransactionStyles from "../styles/TableTransaction.module.css";
import { useWallet } from "../context/WalletContext";
import Popup from "./Popup.component";

// Ajout de la prop 'lang' pour la synchronisation globale
function TableWallet({ selectedId, activeWalletTransactions, lang }) {
  const [symbol, setSymbol] = useState("");
  const [maxCount, setMaxCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { walletsLines, actualiseWalletsLines, valuesCached } = useWallet();

  // Traductions des éléments du tableau
  const translations = {
    fr: {
      h_symbol: "Libellé",
      h_quantity: "Quantité",
      h_buy: "Valeur achat",
      h_current: "Valeur actuelle",
      h_var_dollar: "Var $",
      h_var_percent: "Var %",
      h_gain: "Gain",
      h_action: "Action",
      btn_sell: "Vendre",
      pop_title: "Vendre",
      pop_sub: "Vendre"
    },
    en: {
      h_symbol: "Symbol",
      h_quantity: "Quantity",
      h_buy: "Buy Price",
      h_current: "Current Price",
      h_var_dollar: "Var $",
      h_var_percent: "Var %",
      h_gain: "Profit",
      h_action: "Action",
      btn_sell: "Sell",
      pop_title: "Sell",
      pop_sub: "Sell"
    }
  };

  // Sélection sécurisée de la langue
  const t = translations[lang] || translations.fr;

  useEffect(() => {
    if (!(walletsLines && walletsLines[selectedId])) actualiseWalletsLines();
  }, [activeWalletTransactions]);

  return (
    <>
      <table className={TableTransactionStyles.transactionTable}>
        <thead>
          <tr className={TableTransactionStyles.tr}>
            <th className={TableTransactionStyles.th}>{t.h_symbol}</th>
            <th className={TableTransactionStyles.th}>{t.h_quantity}</th>
            <th className={TableTransactionStyles.th}>{t.h_buy}</th>
            <th className={TableTransactionStyles.th}>{t.h_current}</th>
            <th className={TableTransactionStyles.th}>{t.h_var_dollar}</th>
            <th className={TableTransactionStyles.th}>{t.h_var_percent}</th>
            <th className={TableTransactionStyles.th}>{t.h_gain}</th>
            <th className={TableTransactionStyles.th}>{t.h_action}</th>
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
                  <td data-label={t.h_symbol} className={TableTransactionStyles.td} style={{fontWeight: 'bold'}}>
                    {item?.symbol}
                  </td>
                  <td data-label={t.h_quantity} className={TableTransactionStyles.td}>
                    {item?.quantity?.toFixed(2)}
                  </td>
                  <td data-label={t.h_buy} className={TableTransactionStyles.td}>
                    {averagePriceAtExecution?.toFixed(2)} $
                  </td>
                  <td data-label={t.h_current} className={TableTransactionStyles.td}>
                    {value?.toFixed(2)} $
                  </td>
                  <td data-label={t.h_var_dollar} className={TableTransactionStyles.td} style={{ color: isPositive ? '#2ecc71' : '#e74c3c' }}>
                    {isPositive ? '+' : ''}{variation.toFixed(2)} $
                  </td>
                  <td data-label={t.h_var_percent} className={TableTransactionStyles.td} style={{ color: isPositive ? '#2ecc71' : '#e74c3c' }}>
                    {averagePriceAtExecution ? (variation / averagePriceAtExecution * 100).toFixed(2) : "0.00"} %
                  </td>
                  <td data-label={t.h_gain} className={TableTransactionStyles.td} style={{fontWeight: 'bold'}}>
                    {(variation * item.quantity).toFixed(2)} $
                  </td>
                  <td data-label={t.h_action} className={TableTransactionStyles.td}>
                    <button 
                      className={TableTransactionStyles.sellButton}
                      onClick={() => { 
                        setIsOpen(true); 
                        setSymbol(item.symbol); 
                        setMaxCount(item.quantity); 
                      }}
                    >
                      {t.btn_sell}
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Pop-up de vente également traduite */}
      <Popup
        title={t.pop_title}
        subtitle={`${t.pop_sub} ${symbol}`}
        sell={true}
        symbol={symbol}
        maxCount={maxCount}
        open={isOpen}
        close={() => setIsOpen(false)}
        lang={lang}
      />
    </>
  );
}

export default TableWallet;