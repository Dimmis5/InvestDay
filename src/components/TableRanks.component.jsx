import React from "react";
import styles from "../styles/TableTransaction.module.css";

/**
 * @param {{ data: any[], userId: any, lang: any }} props
 */
function TableRanks({ data = [], userId, lang }) {
  // ... (reste du code identique à l'étape précédente)
  const translations = {
    fr: {
      rank: "CLASSEMENT",
      investor: "INVESTISSEUR",
      totalValue: "VALEUR TOTALE",
      loading: "Chargement des traders...",
      you: "(Vous)"
    },
    en: {
      rank: "RANKING",
      investor: "INVESTOR",
      totalValue: "TOTAL VALUE",
      loading: "Loading traders...",
      you: "(You)"
    }
  };

  const t = translations[lang] || translations.fr;

  const rankedData = [...data]
    .filter((item) => item?.user?.isAdmin === false)
    .sort((a, b) => (Number(b.publicWalletValue) || 0) - (Number(a.publicWalletValue) || 0));

  if (!rankedData.length) {
    return <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>{t.loading}</p>;
  }

  return (
    <table className={styles.transactionTable}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}>{t.rank}</th>
          <th className={styles.th}>{t.investor}</th>
          <th className={styles.th}>{t.totalValue}</th>
        </tr>
      </thead>
      <tbody>
        {rankedData.map((item, index) => {
          const rank = index + 1;
          const medals = ["🥇", "🥈", "🥉"];
          const totalValue = Number(item.publicWalletValue) || 0;
          const isMe = item.user?.id === userId;

          return (
            <tr 
              key={item.id} 
              className={`${styles.tr} ${isMe ? styles.currentUserRow : ""}`}
            >
              <td className={styles.td} style={{ fontWeight: '700' }}>
                {rank <= 3 ? medals[index] : `#${rank}`}
              </td>
              <td className={styles.td}>
                <div style={{ fontWeight: '600' }}>
                  {item.user?.name || `Joueur ${item.user?.studentId || ''}`} 
                  {isMe && <span style={{ marginLeft: '8px', opacity: 0.7 }}>{t.you}</span>}
                </div>
              </td>
              <td className={styles.td} style={{ fontWeight: '800' }}>
                {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} $
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TableRanks;