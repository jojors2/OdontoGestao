
import { useState, useEffect } from "react";

import Header from "../../Header/Header";
import Sidebar from "../../Sidebar/Sidebar";

import "./AppLayout.css";

function AppLayout({ children }) {
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function buscarUsuario() {
      try {
        const resposta = await fetch(
          "http://localhost:3001/api/usuarios/me",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!resposta.ok) {
          throw new Error("Não foi possível buscar o usuário.");
        }

        const dados = await resposta.json();

        setUsuario(dados);
      } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
      }
    }

    buscarUsuario();
  }, []);

  function toggleMenu() {
    const mobile = window.matchMedia(
      "(max-width: 768px)"
    ).matches;

    if (mobile) {
      setSidebarMobileOpen((valorAtual) => !valorAtual);
      return;
    }

    setSidebarMinimized((valorAtual) => !valorAtual);
  }

  function toggleSidebarDesktop() {
    setSidebarMinimized((valorAtual) => !valorAtual);
  }

  function fecharSidebarMobile() {
    setSidebarMobileOpen(false);
  }

  return (
    <div className="app-layout">
      <Header
        onMenuClick={toggleMenu}
        usuario={usuario}
      />

      <div
        className={`app-body ${
          sidebarMinimized ? "sidebar-is-minimized" : ""
        }`}
      >
        <Sidebar
          minimized={sidebarMinimized}
          onToggle={toggleSidebarDesktop}
          mobileOpen={sidebarMobileOpen}
          onCloseMobile={fecharSidebarMobile}
        />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
