import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Se já estiver logado, redireciona direto para o dashboard
  useEffect(() => {
    const usuarioLogado = localStorage.getItem("usuarioLogado") === "true";
    if (usuarioLogado) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  async function fazerLogin(event) {
    event.preventDefault();

    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "E-mail ou senha inválidos.");
        return;
      }

      // Salva os dados do usuário autenticado no localStorage
      localStorage.setItem("usuarioLogado", "true");
      localStorage.setItem("usuario", JSON.stringify(dados));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Erro de conexão:", err);
      setErro("Não foi possível conectar ao servidor. Verifique se o backend está ligado na porta 3001.");
    } finally {
      setCarregando(false);
    }
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
              disabled={carregando}
              required
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
                disabled={carregando}
                required
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
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;