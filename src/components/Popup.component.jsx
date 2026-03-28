import React, { useEffect, useState } from "react";
import styles from "../styles/Popup.module.css";
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
  lang,
  isMarketOpen = true,
  onSellConfirm,
}) {
  const { wallets, selectedId, actualiseWalletsLines } = useWallet();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useFetch();

  const isCrypto = symbol?.toUpperCase().includes("USD") && !symbol?.toUpperCase().includes(".PA");
  const precision = isCrypto ? 4 : 1; 
  const step = isCrypto ? 0.001 : 1;

  const translations = {
    fr: {
      btnBuy: "Acheter",
      btnSell: "Vendre",
      btnClose: "Fermer la fenêtre",
      errQty: "Quantité invalide",
      successOrder: "Ordre exécuté avec succès !",
      successOrderPending: "Ordre enregistré (En attente d'ouverture)",
      errOrder: "Erreur lors de la transaction",
      marketClosed: "Le marché est actuellement fermé. Votre ordre sera exécuté à la prochaine ouverture.",
      btn_sell_all: "Vendre tout",
      btn_place_order: "Placer l'ordre"
    },
    en: {
      btnBuy: "Buy",
      btnSell: "Sell",
      btnClose: "Close window",
      errQty: "Invalid quantity",
      successOrder: "Order executed successfully!",
      successOrderPending: "Order placed (Pending market open)",
      errOrder: "Transaction error",
      marketClosed: "Market is closed. Your order will execute at next opening.",
      btn_sell_all: "Sell all",
      btn_place_order: "Place order"
    },
  };
  const t = translations[lang] || translations.fr;

  useEffect(() => {
    if (open) {
      setCount(0);
      setIsLoading(false);
    }
  }, [open, symbol]);

  const increment = () => {
    setCount(prev => Math.min(Number(prev) + step, maxCount).toFixed(precision));
  };

  const decrement = () => {
    setCount(prev => Math.max(Number(prev) - step, 0).toFixed(precision));
  };

  const executeOrder = () => {
    const quantity = Number(count);
    if (quantity <= 0 || isLoading) return;
    
    setIsLoading(true);
    const payload = {
      walletId: wallets[selectedId].id,
      symbol: symbol,
      amount: quantity.toFixed(precision),
      selling: sell ? "true" : "false",
      status: isMarketOpen ? "EXECUTED" : "PENDING" 
    };

    fetch.post("/api/transactions", payload)
      .then(() => {
        if (sell && onSellConfirm) onSellConfirm(symbol, quantity, maxCount);
        
        toast.success(isMarketOpen ? t.successOrder : t.successOrderPending, {
          className: styles.toastSuccess,
          progressClassName: styles.toastProgressSuccess,
        });

        actualiseWalletsLines();
        close();
      })
      .catch(() => {
        toast.error(t.errOrder, {
          className: styles.toastError,
          progressClassName: styles.toastProgressError,
        });
      })
      .finally(() => setIsLoading(false));
  };

  if (!open) return null;

  
  const getButtonText = () => {
    if (isLoading) return "...";
    if (sell) return t.btnSell;
    return isMarketOpen ? t.btnBuy : t.btn_place_order;
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>
            <h1>{symbol}</h1>
            <span className={styles.modalSubtitle}>{subtitle}</span>
          </div>

          {/* BANDEAU INFO MARCHÉ FERMÉ (adapté au nouveau style) */}
          {!isMarketOpen && (
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "12px",
              fontSize: "0.8rem",
              color: "#64748b",
              marginBottom: "20px",
              textAlign: "center",
              lineHeight: "1.4"
            }}>
              <span style={{ marginRight: "6px" }}>⏳</span>
              {t.marketClosed}
            </div>
          )}

          <div className={styles.inputNumberWrapper}>
            <button onClick={decrement}>−</button>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              onBlur={() => setCount(Math.min(Math.max(Number(count), 0), maxCount).toFixed(precision))}
            />
            <button onClick={increment}>+</button>
          </div>

          {sell && (
            <button className={styles.sellAllLink} onClick={() => setCount(Number(maxCount).toFixed(precision))}>
              {t.btn_sell_all} ({Number(maxCount).toFixed(precision)})
            </button>
          )}

          <button
            className={styles.buttonBuy}
            onClick={executeOrder}
            disabled={isLoading}
            style={
              sell ? { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)" } : 
              (!isMarketOpen ? { background: "#94a3b8", boxShadow: "none" } : {})
            }
          >
            {getButtonText()}
          </button>

          <div className={styles.modalFooter}>
            <button className={styles.closeLink} onClick={close}>
              {t.btnClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popup;