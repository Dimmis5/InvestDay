import React from "react";
import footerStyles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={footerStyles.container}>
      <div className={footerStyles.content}>

        <div className={footerStyles.descriptionSection}>
          <p className={footerStyles.twelveDataText}>
            <strong>InvestDays</strong> uses Twelve Data technology to access financial data. 
            Twelve Data is one of the world’s leading financial data providers and delivers accurate, 
            real-time, and historical data solutions, covering global stocks, forex, crypto, ETFs, 
            mutual funds, and more. Powered by robust technologies across REST API and WebSocket streaming, 
            the platform provides unparalleled access to live data—e.g., BTC/USD—the latest corporate events, 
            financial reports, analytics data, and economic calendar.
          </p>
        </div>

        <div className={footerStyles.linksSection}>
          <div className={footerStyles.linkGroup}>
            <h4>Support</h4>
            <a href="/contact">Contactez-nous</a>
            <a href="https://discord.gg/hstvfHKP" target="_blank" rel="noreferrer">
              Notre Discord
            </a>
          </div>

          <div className={footerStyles.linkGroup}>
            <h4>Légal</h4>
            <a href="/MentionsLegales">Mentions Légales</a>
            <a href="/confidentialite">Confidentialité</a>
          </div>
        </div>
      </div>

      <div className={footerStyles.bottomBar}>
        <span>© {new Date().getFullYear()} InvestDays - v2.0</span>
        <span>GarageISEP</span>
      </div>
    </footer>
  );
}