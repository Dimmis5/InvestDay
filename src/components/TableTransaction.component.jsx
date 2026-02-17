import React, { useEffect, useState } from "react";
import TableTransactionStyles from "../styles/TableTransaction.module.css";

function TableTransaction({ dataTransactions, lang }) {
  // Traductions du tableau des transactions
  const translations = {
    fr: {
      date: "Date de la transaction",
      company: "Société",
      quantity: "Quantité",
      value: "Valeur",
      type: "Type",
      status: "Status",
      buy: "Achat",
      sell: "Vente"
    },
    en: {
      date: "Transaction Date",
      company: "Company",
      quantity: "Quantity",
      value: "Value",
      type: "Type",
      status: "Status",
      buy: "Buy",
      sell: "Sell"
    }
  };

  // Sélection de la langue (JavaScript pur pour éviter l'erreur ts(8016))
  const t = translations[lang] || translations.fr;

  const [data, setData] = useState([]);

  useEffect(() => {
    if (dataTransactions) {
      const formattedData = dataTransactions.map((item) => {
        return {
          date: item?.createdAt,
          libelle: item?.symbol,
          quantite: item?.quantity,
          valeurAchat: item?.valueAtExecution,
          // Traduction dynamique du type de transaction
          type: item?.isSellOrder ? t.sell : t.buy,
          status: item?.status,
        };
      });
      setData(formattedData);
    }
  }, [dataTransactions, t]); // On ajoute 't' en dépendance pour recalculer si la langue change

  return (
    <table className={TableTransactionStyles.transactionTable}>
      <thead>
        <tr className={TableTransactionStyles.tr}>
          <th scope="col" className={TableTransactionStyles.th}>{t.date}</th>
          <th scope="col" className={TableTransactionStyles.th}>{t.company}</th>
          <th scope="col" className={TableTransactionStyles.th}>{t.quantity}</th>
          <th scope="col" className={TableTransactionStyles.th}>{t.value}</th>
          <th scope="col" className={TableTransactionStyles.th}>{t.type}</th>
          <th scope="col" className={TableTransactionStyles.th}>{t.status}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className={TableTransactionStyles.tr}>
            <td data-label={t.date} className={TableTransactionStyles.td}>
              {item?.date ? new Date(item.date).toLocaleDateString() : "-"}
            </td>
            <td data-label={t.company} className={TableTransactionStyles.td}>
              {item?.libelle}
            </td>
            <td data-label={t.quantity} className={TableTransactionStyles.td}>
              {item?.quantite}
            </td>
            <td data-label={t.value} className={TableTransactionStyles.td}>
              {item?.valeurAchat?.toFixed(2)} $
            </td>
            <td data-label={t.type} className={TableTransactionStyles.td}>
              {item?.type}
            </td>
            <td data-label={t.status} className={TableTransactionStyles.td}>
              <span style={{ 
                fontWeight: 'bold', 
                color: item?.status === 'SUCCESS' ? '#2ecc71' : '#f39c12' 
              }}>
                {item?.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableTransaction;