import Head from "next/head";
import Image from "next/image";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useFetch } from "../../context/FetchContext.js";
import { useWallet } from "../../context/WalletContext";

import homeStyles from "../../styles/Home.module.css";
import marketStyles from "../../styles/Market.module.css";
import TableSearch from "../../components/TableSearch.component.jsx";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";

export default function Market() {
  const { wallets, selectedId, selectWallet } = useWallet();
  const [data, setData] = useState([] as any);
  const [input, setInput] = useState("");
  const fetch = useFetch();

const defaultStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
  ];

  // Effet Debounce pour limiter les appels API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (input.trim().length > 1) {
        fetch.get("/api/stock/search?term=" + input)
          .then((data) => setData(data))
          .catch((err) => console.error("API Limit reached or Error:", err));
      } else if (input === "") {
        setData([]);
      }
    }, 600); // 600ms pour être sûr de ne pas spammer l'API gratuite

    return () => clearTimeout(delayDebounceFn);
  }, [input]);

  const onChange = (e: any) => setInput(e.target.value);

  const handleKeyDown = (event: any) => {
    if (event.key === "Escape") {
      setInput("");
      setData([]);
    }
  };

  const list = (data && data.length > 0) 
    ? data.filter((item: any) => !item.name?.toLowerCase().includes("warrant"))
          .map((item: any) => ({ symbol: item.symbol, name: item.name }))
    : defaultStocks;

  return (
    <>
      <Head>
        <title>InvestTrade - Marchés</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={homeStyles.pageContainer}>
        {/* Header Moderne avec Cash */}
        <div className={homeStyles.marketHeader}>
          <div>
            <h1 className={homeStyles.marketTitle}>Marchés</h1>
            <p className={homeStyles.marketSub}>Recherchez des valeurs sans saturer l'API</p>
          </div>

          <div className={homeStyles.statCard} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
            <Image src="/assets/cash.svg" width={25} height={25} alt="cash" style={{ marginRight: '12px' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Disponible</span>
              <span style={{ fontWeight: '700' }}>{(wallets[selectedId]?.cash || 0).toFixed(2)} $</span>
            </div>
          </div>
        </div>

        {/* Sélecteur de Portfolio */}
        <div className={homeStyles.filterBar}>
          {wallets.map((_, index) => (
            <button
              key={index}
              className={selectedId === index ? homeStyles.filterActive : homeStyles.filterItem}
              onClick={() => selectWallet(index)}
            >
              Portfolio n°{index + 1}
            </button>
          ))}
        </div>

        {/* Barre de Recherche Jaune */}
        <div className={marketStyles.searchInput} style={{ width: '100%', maxWidth: '500px', margin: '0 auto 30px' }}>
          <div style={{ borderRadius: '12px', border: '2px solid #f3ca3e', backgroundColor: 'white' }}>
            <input
              className={marketStyles.formSubmit}
              type="text"
              placeholder="Tapez le nom d'une entreprise..."
              value={input}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              style={{ height: '45px', border: 'none' }}
            />
          </div>
        </div>

        {/* Tableau de résultats */}
        <div className={homeStyles.assetCard} style={{ padding: '20px' }}>
          <TableSearch data={list} />
        </div>
      </main>
    </>
  );
}

Market.getLayout = function getLayout(page: AppProps) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};