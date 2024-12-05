import React from "react";
import logo from "../../img/wobot_logo_blue.svg";
import './Header.css'

const Header = () => {
  return (
    <div className="header">
      <img src={logo} alt="logo" />
    </div>
  );
};

export default Header;
