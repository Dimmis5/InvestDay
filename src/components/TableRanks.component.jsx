import React from "react";
import styles from "../styles/TableTransaction.module.css";

function TableRanks({ data = [] }) {
  const rankedData = [...data]
    .filter((item) => item?.user?.isAdmin === false)
    .sort((a, b) => (Number(b.publicWalletValue) || 0) - (Number(a.publicWalletValue) || 0));

  if (!rankedData.length) {
    return <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Aucun trader trouvé.</p>;
  }

  return (
    <table className={styles.transactionTable}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}>RANG</th>
          <th className={styles.th}>TRADER</th>
          <th className={styles.th}>VALEUR PORTEFEUILLE</th>
          <th className={styles.th}>WALLET ID</th>
        </tr>
      </thead>
      <tbody>
        {rankedData.map((item, index) => {
          const rank = index + 1;
          const medals = ["🥇", "🥈", "🥉"];
          const val = Number(item.publicWalletValue) || 0;
          
          // Détermination de la classe de podium
          let podiumClass = "";
          if (rank === 1) podiumClass = styles.goldRow;
          else if (rank === 2) podiumClass = styles.silverRow;
          else if (rank === 3) podiumClass = styles.bronzeRow;

          return (
            <tr key={item.id} className={`${styles.tr} ${podiumClass}`}>
              <td className={styles.td} style={{ fontWeight: '700' }}>
                {rank <= 3 ? medals[index] : `#${rank}`}
              </td>
              <td className={styles.td}>
                <div style={{ fontWeight: '600' }}>{item.user?.name || item.user?.email?.split('@')[0]}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>{item.user?.email}</div>
              </td>
              <td className={styles.td} style={{ fontWeight: '800' }}>
                {val.toLocaleString(undefined, { minimumFractionDigits: 2 })} $
              </td>
              <td className={styles.td} style={{ color: '#888', fontSize: '0.85rem' }}>
                ID: {item.id}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TableRanks;