import React, { useEffect, useState } from "react";
import PopupStyles from "../styles/Popup.module.css";
import { useFetch } from "../context/FetchContext.js";
import { useWallet } from "../context/WalletContext";
import { toast } from "react-toastify";

function Popup({
  title,
  subtitle,
  sell,
  symbol,
  maxCount = 10000,
  open,
  close,
}) {
  const { wallets, selectedId } = useWallet();
  const [count, setCount] = useState(0);
  const fetch = useFetch();

  // Reset le compteur quand on change d'action ou qu'on ouvre/ferme
  useEffect(() => {
    setCount(0);
  }, [open, symbol]);

  // Gestion simplifiée des boutons + et -
  const increment = () => {
    setCount(prev => {
      const nextVal = (Number(prev) + 0.1);
      return nextVal >= maxCount ? maxCount.toFixed(1) : nextVal.toFixed(1);
    });
  };

  const decrement = () => {
    setCount(prev => {
      const nextVal = (Number(prev) - 0.1);
      return nextVal <= 0 ? (0).toFixed(1) : nextVal.toFixed(1);
    });
  };


  // Gestion sécurisée des boutons + et -
  // const increment = () => {
  //   Si maxCount est 0 ou invalide, on met une limite arbitraire pour le test
  //   const limit = (maxCount > 0) ? maxCount : 9999; 
    
  //   setCount(prev => {
  //     const nextVal = (Number(prev) + 0.1);
  //     if (nextVal >= limit) return Number(limit).toFixed(1);
  //     return nextVal.toFixed(1);
  //   });
  // };

  // const decrement = () => {
  //   setCount(prev => {
  //     const nextVal = (Number(prev) - 0.1);
  //     if (nextVal <= 0) return (0).toFixed(1);
  //     return nextVal.toFixed(1);
  //   });
  // };

  const handleChange = (e) => {
    const val = e.target.value;
    
    // Autoriser la saisie vide ou le point pour taper des décimales
    if (val === "") {
      setCount("");
      return;
    }

    const num = Number(val);
    if (isNaN(num)) return;

    if (num > maxCount) {
      setCount(maxCount);
    } else {
      setCount(val);
    }
  };

  const executeOrder = () => {
    let quantity = Number(count);
    if (quantity <= 0) {
      toast.error("Veuillez saisir une quantité.");
      return;
    }

    const payload = {
      walletId: wallets[selectedId].id,
      symbol: symbol,
      amount: quantity.toFixed(1),
      selling: sell ? "true" : "false",
    };

    console.log(sell ? "SELLING" : "BUYING", payload);
    
    fetch.post("/api/transactions/", payload)
      .then(() => {
        toast.success("Votre ordre a été créé !");
        close();
      })
      .catch(() => toast.error("Erreur lors de l'ordre"));
  };

  if (!open) return null;

  return (
    <div className={PopupStyles.modalBackdrop}>
      <div className={PopupStyles.modal}>
        <div className={PopupStyles.modalContent}>
          <div className={PopupStyles.modalTitle}>
            <h1>{title} : {symbol}</h1>
            <span className={PopupStyles.modalSubtitle}>{subtitle}</span>
          </div>

          <div className={PopupStyles.inputNumberWrapper}>
            {/* On retire handleCount au profit de fonctions directes */}
            <button className={PopupStyles.decrease} onClick={decrement}>
              -
            </button>
            <input 
              type="number" 
              step="0.1" 
              value={count} 
              onChange={handleChange} 
              onBlur={() => setCount(Number(count).toFixed(1))} // Formate au clic extérieur
            />
            <button className={PopupStyles.increase} onClick={increment}>
              +
            </button>
          </div>

          <button
            className={PopupStyles.buttonBuy}
            onClick={executeOrder}
          >
            {sell ? "Vendre" : "Acheter"}
          </button>
        </div>

        <div className={PopupStyles.modalFooter}>
          <button className={PopupStyles.closeLink} onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;