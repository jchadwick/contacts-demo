import React from "react";
import { Router, Link, LinkGetProps } from "@reach/router";
import { ContactsPage } from "./Pages/ContactsPage";
import { DiagnosticsPage } from "./Pages/DiagnosticsPage";
import clsx from "clsx";

export const App = () => (
  <div id="app" className="container">
    <MainNav />
    <Router>
      <DiagnosticsPage path="diag" />
      <ContactsPage default path="contacts" />
    </Router>
  </div>
);

const MainNav = () => {
  const getLinkProps = ({ isPartiallyCurrent }: LinkGetProps) => ({
    className: clsx("nav-link", { active: isPartiallyCurrent })
  });

  return (
    <nav
      style={{
        borderBottom: 0,
        marginTop: -58,
        marginLeft: "1em",
        paddingBottom: "1em"
      }}
      className="row nav nav-tabs"
    >
      <Link to="contacts" getProps={getLinkProps}>
        Demo App
      </Link>
      <Link to="diag" getProps={getLinkProps}>
        Test Page
      </Link>
    </nav>
  );
};
