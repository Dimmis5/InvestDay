import React from "react";
import TableTransactionStyles from "../styles/Ranks.module.css";

function TableRanks(props) {
  // 1. Filtrer les admins
  // 2. TRIER par valeur (publicWalletValue) du plus grand au plus petit
  const data = props.data
    ? props.data
        .filter((item) => item?.user?.isAdmin === false)
        .sort((a, b) => (b.publicWalletValue || 0) - (a.publicWalletValue || 0))
    : [];

  // Fonction utilitaire pour générer proprement un bloc du podium
  const renderPodiumItem = (item, rankText) => {
    // Si l'item n'existe pas (ex: seulement 2 joueurs), on cache le bloc
    if (!item) return <div className={TableTransactionStyles.podiumItem} style={{ visibility: 'hidden' }} />;
    
    // On utilise le nom "63810" vu dans ta DB ou le pseudo de l'email
    const displayName = item.user?.name || item.user?.email?.split('@')[0];
    
    return (
      <div className={TableTransactionStyles.podiumItem}>
        <div className={TableTransactionStyles.podiumItemRank}>{rankText}</div>
        <div className={TableTransactionStyles.podiumItemName}>Wallet n°{item.id}</div>
        <div className={TableTransactionStyles.podiumItemScore}>
          {(item.publicWalletValue || 0).toFixed(2)}$
        </div>
        <div className={TableTransactionStyles.podiumItemIsep}>{displayName}</div>
      </div>
    );
  };

  return (
    <div className={TableTransactionStyles.container}>
      {/* SECTION PODIUM : Affiche les 3 premiers triés */}
      <div className={TableTransactionStyles.podium}>
        {renderPodiumItem(data[1], "2eme place :")} {/* Index 1 après tri */}
        {renderPodiumItem(data[0], "1ere place :")} {/* Index 0 après tri */}
        {renderPodiumItem(data[2], "3eme place :")} {/* Index 2 après tri */}
      </div>

      {/* SECTION TABLEAU : Affiche le reste (index 3 à 9) */}
      <table className={TableTransactionStyles.transactionTable}>
        <thead>
          <tr className={TableTransactionStyles.tr}>
            <th className={TableTransactionStyles.th}>Rang</th>
            <th className={TableTransactionStyles.th}>Nom</th>
            <th className={TableTransactionStyles.th}>Wallet Id</th>
            <th className={TableTransactionStyles.th}>Valeur portefeuille</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(3, 10).map((item, index) => (
            <tr key={item.id} className={`${TableTransactionStyles.tr} ${TableTransactionStyles.ranks}`}>
              <td className={TableTransactionStyles.td}>{index + 4}</td>
              <td className={TableTransactionStyles.td}>{item.user?.name || item.user?.email}</td>
              <td className={TableTransactionStyles.td}>{item.id}</td>
              <td className={TableTransactionStyles.td}>{(item.publicWalletValue || 0).toFixed(2)}$</td>
            </tr>
          ))}
          {data.length <= 3 && (
             <tr>
               <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                 Aucun autre joueur classé pour le moment.
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TableRanks;