import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const usuarioLogado =
    localStorage.getItem("usuarioLogado") === "true";

  if (!usuarioLogado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;