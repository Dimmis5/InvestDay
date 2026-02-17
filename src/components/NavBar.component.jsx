import React, { useState } from "react";
import navBarStyles from "../styles/NavBar.module.css";
import NavTab from "./NavTab.component";
import { useAuthentification } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import Image from "next/image";
import Link from "next/link";

function Navbar() {
  const { logout, user } = useAuthentification();
  const { wallets, selectedId, selectWallet } = useWallet();
  const [active, setActive] = useState("accueil");
  const [menu, setMenu] = useState(false);

  function toggleMenu() {
    setMenu((prevState) => !prevState);
  }

  return (
    <nav className={navBarStyles.navBarContainer}>
      
      {/* SECTION GAUCHE : Menu de navigation */}
      <ul
        className={`${navBarStyles.navButtonContainer} ${
          menu ? navBarStyles.isActived : ""
        }`}
        onClick={() => setMenu(false)}
      >
        <NavTab handleToggle={setActive} active={active} id="accueil" title="Accueil" to="/" />
        <NavTab handleToggle={setActive} active={active} id="wallet" title="Portefeuille" to="/wallet" />
        <NavTab handleToggle={setActive} active={active} id="market" title="Marchés" to="/market" />
        <NavTab handleToggle={setActive} active={active} id="ranking" title="Classement" to="/ranks" />
      </ul>

      {/* SECTION CENTRALE : Sélecteur de Portfolio (reste au milieu) */}
      {user && wallets && (
        <div className={navBarStyles.centerSection}>
          <div className={navBarStyles.portfolioBadge}>
            <span className={navBarStyles.walletIcon}>📁</span>
            <span className={navBarStyles.portfolioTitle}>Portfolio n°{selectedId + 1}</span>
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

      {/* SECTION DROITE : Logo | Email | Déco */}
      <div className={navBarStyles.rightSection}>
        {user && (
          <div className={navBarStyles.userInfoRight}>
            <span className={navBarStyles.userEmail}>{user.email}</span>
            <span className={navBarStyles.separator}>|</span>
          </div>
        )}
        
        <div className={navBarStyles.logoContainer}>
          <Link href={"/"}>
            <Image src="/assets/INVEST.png" width={100} height={150} alt="logo" priority />
          </Link>
        </div>

        <div className={navBarStyles.logoutBtn} onClick={() => logout()}>
          <Image src="/assets/deco.png" width={35} height={35} alt="Déconnexion" />
        </div>
      </div>

      <div className={`${navBarStyles.menu} ${menu ? navBarStyles.change : ""}`} onClick={toggleMenu}>
        <div className={navBarStyles.menuLine1}></div>
        <div className={navBarStyles.menuLine2}></div>
        <div className={navBarStyles.menuLine3}></div>
      </div>
    </nav>
  );
}

export default Navbar;