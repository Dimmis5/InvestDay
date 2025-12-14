import Head from "next/head";

import { Inter } from "@next/font/google";
import homeStyles from "../../styles/Home.module.css";
import marketStyles from "../../styles/Market.module.css";

import InfoBox from "../../components/InfoBox.component.jsx";
import TableSearch from "../../components/TableSearch.component.jsx";
import DashBoardLayout from "../../components/layouts/DashBoard.layout";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useFetch } from "../../context/FetchContext.js";

import wallet_image from "src/public/assets/wallet.svg";
import Button from "../../components/Button.component";
import { useWallet } from "../../context/WalletContext";

const inter = Inter({ subsets: ["latin"] });

export default function Market(this: any) {
  const { wallets, selectedId, selectWallet, assetsCached } = useWallet();
  const [data, setData] = useState([] as any);
  const [input, setInput] = useState("");
  const fetch = useFetch();

  // Actions populaires affichées par défaut
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

  const onChange = (e: any) => {
    const value = e.target.value;
    setInput(value);
    
    // Si l'utilisateur efface tout, revenir aux actions par défaut
    if (value === "") {
      setData([]);
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && input !== null && input.trim() !== "") {
      fetchSearch(input);
    } else if (event.key === "Escape") {
      // Touche Échap pour revenir aux actions par défaut
      setInput("");
      setData([]);
    }
  };

  function fetchSearch(symbol: string) {
    return fetch
      .get("/api/stock/search?term=" + symbol)
      .then((response) => {
        return response;
      })
      .then((data) => setData(data))
      .catch((error) => {
        console.log(error);
      });
  }

  let list = [];

  // Utiliser les résultats de recherche OU les actions par défaut
  if (typeof data !== "undefined" && data.length !== 0) {
    // Résultats de recherche
    for (let i = 0; i < data.length; i++) {
      // Filtrer les warrants
      if (
        data[i]["name"] &&
        (data[i]["name"].includes("warrant") ||
          data[i]["name"].includes("Warrant") ||
          data[i]["name"].includes("WARRANT") ||
          data[i]["name"].includes("Warrants") ||
          data[i]["name"].includes("WARRANTS") ||
          data[i]["name"].includes("warrants"))
      ) {
        continue;
      }
      list.push({
        symbol: data[i]["symbol"],
        name: data[i]["name"],
      });
    }
  } else {
    // Actions par défaut si pas de recherche
    list = defaultStocks;
  }

  return (
    <>
      <Head>
        <title>InvestTrade - Marchés</title>
        <meta name="description" content="Recherche d'actions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={homeStyles.pageContainer}>
        <div className={homeStyles.headerContainer}>
          <div className={homeStyles.titleContainer}>
            <h1>Rechercher une valeur</h1>

            {wallets.map((wallet, index) => (
              <Button
                key={index}
                title={`${index + 1}`}
                selected={selectedId === index}
                onClick={() => selectWallet(index)}
              />
            ))}
          </div>
          <div className={homeStyles.infoBoxContainer}>
            <InfoBox
              title={`Cash portefeuille n°${selectedId + 1}`}
              desc={
                wallets
                  ? (wallets[selectedId]?.cash || 0).toFixed(2) + " $"
                  : "$"
              }
              icon={wallet_image}
            />
          </div>
        </div>
        <div className={homeStyles.contentContainer}>
          <div className={marketStyles.searchInput}>
            <div className={marketStyles.formSubmit}>
              <input
                className={marketStyles.formSubmit}
                type="text"
                placeholder="Rechercher une action (ex: AAPL, TSLA, MSFT)..."
                name="value"
                value={input}
                onChange={onChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            {input === "" && (
              <p style={{ 
                textAlign: "center", 
                color: "#666", 
                fontSize: "14px", 
                marginTop: "10px" 
              }}>
                Affichage des actions populaires - Tapez pour rechercher
              </p>
            )}
          </div>

          <div className={homeStyles.tableContainer}>
            <TableSearch data={list} />
          </div>
        </div>
      </main>
    </>
  );
}

Market.getLayout = function getLayout(page: AppProps) {
  return <DashBoardLayout>{page}</DashBoardLayout>;
};