import React from "react";
import TableTransactionStyles from "../styles/TableTransaction.module.css";
import { useRouter } from "next/router";

function TableSearch(props) {
  const router = useRouter();

  if (!props?.data) return <></>;
  
  return (
    <table className={TableTransactionStyles.transactionTable}>
      <thead>
        <tr className={TableTransactionStyles.tr}>
          <th className={TableTransactionStyles.th}>Libellé</th>
          <th className={TableTransactionStyles.th}>Nom</th>
          <th className={TableTransactionStyles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {props.data.map((item, index) => (
          <tr key={index} className={TableTransactionStyles.tr}>
            <td data-label="Libellé" className={TableTransactionStyles.td} style={{ fontWeight: '700' }}>
              {item?.symbol}
            </td>
            <td data-label="Nom" className={TableTransactionStyles.td}>
              {item?.name}
            </td>
            <td data-label="Action" className={TableTransactionStyles.td}>
              {/* Remplacement du composant Button par un bouton jaune stylisé */}
              <button
                style={{
                  backgroundColor: '#f3ca3e', // Jaune du projet
                  color: '#1a1a1a',
                  border: 'none',
                  padding: '8px 25px',
                  borderRadius: '20px', // Arrondi
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'transform 0.2s'
                }}
                onClick={() => {
                  router.push("/market/" + item?.symbol);
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Voir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableSearch;