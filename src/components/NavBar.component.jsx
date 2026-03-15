import React, { useState } from "react";
import navBarStyles from "../styles/NavBar.module.css";
import NavTab from "./NavTab.component";
import { useAuthentification } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { useLanguage } from "../context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import TourGuide from "./TourGuide.component";

function Navbar() {
  const { logout, user } = useAuthentification();
  const { wallets, selectedId, selectWallet } = useWallet();
  const { lang, toggleLanguage } = useLanguage();
  const [active, setActive] = useState("accueil");
  const [menu, setMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function toggleMenu() {
    setMenu((prevState) => !prevState);
  }

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Tour guide — s'affiche uniquement à la première connexion */}
      {user && <TourGuide lang={lang} />}

      <nav className={navBarStyles.navBarContainer}>

        {/* SECTION GAUCHE : LOGO ET LIENS */}
        <div className={navBarStyles.leftSection}>
          <div id="tour-logo" className={navBarStyles.logoContainerLeft}>
            <Link href={"/"}>
              <Image src="/assets/INVEST.png" width={100} height={120} alt="logo" />
            </Link>
          </div>

          <ul
            className={`${navBarStyles.navButtonContainer} ${menu ? navBarStyles.isActived : ""}`}
            onClick={() => setMenu(false)}
          >
          <NavTab handleToggle={setActive} active={active} id="accueil" tourId="tour-accueil" title={lang === "fr" ? "Accueil" : "Home"} to="/" />
          <NavTab handleToggle={setActive} active={active} id="wallet" tourId="tour-wallet" title={lang === "fr" ? "Portefeuille" : "Wallet"} to="/wallet" />
          <NavTab handleToggle={setActive} active={active} id="market" tourId="tour-market" title={lang === "fr" ? "Marchés" : "Markets"} to="/market" />
          <NavTab handleToggle={setActive} active={active} id="ranking" tourId="tour-ranking" title={lang === "fr" ? "Classement" : "Ranking"} to="/ranks" />

            {user && user.admin && (
              <NavTab
                handleToggle={setActive}
                active={active}
                id="admin"
                title={lang === "fr" ? "Admin 🔒" : "Admin 🔒"}
                to="/admin"
              />
            )}
          </ul>
        </div>

        {/* SECTION CENTRE : SÉLECTEUR DE PORTEFEUILLE */}
        {user && wallets && (
          <div id="tour-portfolio-badge" className={navBarStyles.centerSection}>
            <div className={navBarStyles.portfolioBadge}>
              <span className={navBarStyles.walletIcon}>📁</span>
              <span className={navBarStyles.portfolioTitle}>
                {lang === "fr" ? `Portefeuille n°${selectedId + 1}` : `Portfolio #${selectedId + 1}`}
              </span>
              <div className={navBarStyles.miniSelector}>
                {wallets.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectWallet(index);
                    }}
                    className={selectedId === index ? navBarStyles.miniBtnActive : navBarStyles.miniBtn}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION DROITE : LANGUE, EMAIL ET DECO */}
        <div className={navBarStyles.rightSection}>
          <button
            id="tour-lang"
            className={navBarStyles.langBtn}
            onClick={toggleLanguage}
          >
            {lang === "fr" ? "ENGLISH" : "FRANÇAIS"}
          </button>

          {user && (
            <div className={navBarStyles.userInfoRight}>
              <span className={navBarStyles.userEmail}>{user.email}</span>
              <span className={navBarStyles.separator}>|</span>
            </div>
          )}

          <div id="tour-logout" className={navBarStyles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
            <Image src="/assets/deco6.png" width={30} height={30} alt="Déconnexion" />
          </div>
        </div>

        {/* POP-UP DE CONFIRMATION DE DÉCONNEXION */}
        {showLogoutModal && (
          <div className={navBarStyles.modalOverlay}>
            <div className={navBarStyles.modalBox}>
              <h3>{lang === "fr" ? "Déconnexion" : "Logout"}</h3>
              <p>
                {lang === "fr"
                  ? "Êtes-vous sûr de vouloir vous déconnecter ?"
                  : "Are you sure you want to log out?"}
              </p>
              <div className={navBarStyles.modalButtons}>
                <button className={navBarStyles.confirmBtn} onClick={handleConfirmLogout}>
                  {lang === "fr" ? "Oui, me déconnecter" : "Yes, log me out"}
                </button>
                <button className={navBarStyles.cancelBtn} onClick={() => setShowLogoutModal(false)}>
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MENU BURGER MOBILE */}
        <div className={`${navBarStyles.menu} ${menu ? navBarStyles.change : ""}`} onClick={toggleMenu}>
          <div className={navBarStyles.menuLine1}></div>
          <div className={navBarStyles.menuLine2}></div>
          <div className={navBarStyles.menuLine3}></div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;