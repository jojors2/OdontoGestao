import Header from "./Header";
import Sidebar from "./Sidebar";

function AppLayout({ children }) {
  return (
    <>
      <Header />
      <Sidebar />

      <main className="main-content">
        {children}
      </main>
    </>
  );
}

export default AppLayout;