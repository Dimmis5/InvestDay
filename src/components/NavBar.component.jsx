import React, { useState } from "react";
import navBarStyles from "../styles/NavBar.module.css";
import NavTab from "./NavTab.component";
import logo from "src/public/assets/logo.webp";
import { useAuthentification } from "../context/AuthContext";
import Image from "next/image";
import Link from "next/link";

function Navbar() {
  const { logout, user } = useAuthentification();
  const [active, setActive] = useState("l1");
  const [menu, setMenu] = useState(false);

  function handleToggle(state) {
    setActive(state);
  }

  function toggleMenu() {
    setMenu((prevState) => !prevState);
  }

  return (
    <nav className={navBarStyles.navBarContainer}>
      {/* SECTION GAUCHE : Logo et Identification */}
      <div className={navBarStyles.logoSection}>
        <div className={navBarStyles.logoContainer}>
          <Link id="logo-click" href={"/"}>
            <Image src={logo} width={100} alt="logo" priority />
          </Link>
        </div>

        {user && (
          <div className={navBarStyles.userEmailLeft}>
            {user.email}
          </div>
        )}
      </div>

      {/* SECTION DROITE : Menu de navigation */}
      <ul
        className={`${navBarStyles.navButtonContainer} ${
          menu ? navBarStyles.isActived : ""
        }`}
        onClick={toggleMenu}
      >
        <NavTab
          handleToggle={handleToggle}
          active={active}
          id="accueil"
          title="Accueil"
          to="/"
        />
        <NavTab
          handleToggle={handleToggle}
          active={active}
          id="wallet"
          title="Portefeuille"
          to="/wallet"
        />
        <NavTab
          handleToggle={handleToggle}
          active={active}
          id="market"
          title="Marchés"
          to="/market"
        />
        <NavTab
          handleToggle={handleToggle}
          active={active}
          id="ranking"
          title="Classement"
          to="/ranks"
        />
        <NavTab
          handleToggle={() => logout()}
          active={active}
          id="logout"
          title="Déconnexion"
          to="/login"
        />
      </ul>

      {/* ICONE MENU MOBILE */}
      <div
        className={`${navBarStyles.menu} ${menu ? navBarStyles.change : ""}`}
        onClick={toggleMenu}
      >
        <div className={navBarStyles.menuLine1}></div>
        <div className={navBarStyles.menuLine2}></div>
        <div className={navBarStyles.menuLine3}></div>
      </div>
    </nav>
  );
}

export default Navbar;