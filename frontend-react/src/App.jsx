import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Agenda from "./pages/Agenda/Agenda";
import Lembrete from "./pages/Lembretes/Lembretes"


import AppLayout from "./components/layout/AppLayout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Lembretes from "./pages/Lembretes/Lembretes";
import Pacientes from "./pages/Pacientes/Pacientes";
import Configuracoes from "./pages/Configurações/Configurações";
import Consultas from "./pages/Consultas/Consultas";
import Orcamentos from "./pages/Orcamentos/Orcamentos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Agenda />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
          path="/lembretes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Lembretes />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pacientes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Pacientes />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Configuracoes/>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
          path="/consultas"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Consultas />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orcamentos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Orcamentos />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;