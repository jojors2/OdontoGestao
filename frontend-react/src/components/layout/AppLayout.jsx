import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";

function AppLayout({ children }) {

  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  return (
    <>
      <Header />
      <Sidebar 
        minimized = {sidebarMinimized}
        onToggle = {() => setSidebarMinimized(!sidebarMinimized)}
      />
      <main
      className={`main-content ${
          sidebarMinimized ? "main-content-expanded" : ""
        }`}
      >
        {children}
      </main>
    </>
  );
}

export default AppLayout;