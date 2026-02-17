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
  lang // Ajout de la prop lang passée par le parent
}) {
  const { wallets, selectedId } = useWallet();
  const [count, setCount] = useState(0);
  const fetch = useFetch();

  // Traductions internes de la modale
  const translations = {
    fr: {
      btnBuy: "Acheter",
      btnSell: "Vendre",
      btnClose: "Fermer",
      errQty: "Villez saisir une quantité.",
      successOrder: "Votre ordre a été créé !",
      errOrder: "Erreur lors de l'ordre"
    },
    en: {
      btnBuy: "Buy",
      btnSell: "Sell",
      btnClose: "Close",
      errQty: "Please enter a quantity.",
      successOrder: "Your order has been created!",
      errOrder: "Error during the order"
    }
  };

  // Sélection de la langue sans assertion de type pour éviter l'erreur ts(8016)
  const t = translations[lang] || translations.fr;

  useEffect(() => {
    setCount(0);
  }, [open, symbol]);

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

  const handleChange = (e) => {
    const val = e.target.value;
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
      toast.error(t.errQty); // Toast traduit
      return;
    }

    const payload = {
      walletId: wallets[selectedId].id,
      symbol: symbol,
      amount: quantity.toFixed(1),
      selling: sell ? "true" : "false",
    };
    
    fetch.post("/api/transactions/", payload)
      .then(() => {
        toast.success(t.successOrder); // Toast traduit
        close();
      })
      .catch(() => toast.error(t.errOrder)); // Toast traduit
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
            <button className={PopupStyles.decrease} onClick={decrement}>
              -
            </button>
            <input 
              type="number" 
              step="0.1" 
              value={count} 
              onChange={handleChange} 
              onBlur={() => setCount(Number(count).toFixed(1))}
            />
            <button className={PopupStyles.increase} onClick={increment}>
              +
            </button>
          </div>

          {/* Bouton d'action traduit dynamiquement */}
          <button
            className={PopupStyles.buttonBuy}
            onClick={executeOrder}
          >
            {sell ? t.btnSell : t.btnBuy}
          </button>
        </div>

        <div className={PopupStyles.modalFooter}>
          {/* Bouton fermer traduit */}
          <button className={PopupStyles.closeLink} onClick={close}>
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;