import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function fazerLogin(event) {
    event.preventDefault();

    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    setErro("");

    // Temporário enquanto não temos backend
    localStorage.setItem("usuarioLogado", "true");

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <h1>OdontoGestão</h1>

          <p>
            Gestão simples para o seu consultório
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={fazerLogin}
        >
          <h2>Entrar</h2>

          <div className="form-group">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              Senha
            </label>

            <div className="password-container">
              <input
                id="senha"
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setMostrarSenha(!mostrarSenha)
                }
                title={
                  mostrarSenha
                    ? "Esconder senha"
                    : "Mostrar senha"
                }
                aria-label={
                  mostrarSenha
                    ? "Esconder senha"
                    : "Mostrar senha"
                }
              >
                {mostrarSenha ? "🐵" : "🙈"}
              </button>
            </div>
          </div>

          {erro && (
            <p className="login-error">
              {erro}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;