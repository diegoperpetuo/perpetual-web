import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

function LoginPage() {
  const [emailPlaceholder, setEmailPlaceholder] = useState("E-mail");
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("Senha");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    // Simulação de autenticação
    if (email === "teste@email.com" && password === "123456") {
      localStorage.setItem('token', 'fake-jwt-token');
      console.log('Login successful');
      navigate('/dashboard');
    } else if (email !== "teste@email.com") {
      setError('E-mail não cadastrado.');
    } else if (password !== "123456") {
      setError('Senha incorreta.');
    } else {
      setError('Erro ao fazer login.');
    }
  };

  return (
    <div className="bg-[#1E1A1A] w-screen h-screen relative">
      <AuthHeader variant='login' />
      {/* Logo sempre fixa no topo */}
      <div className="w-80 flex items-center justify-center mx-auto pt-24">
        <img src="/logo.png" alt="logo" />
      </div>
      {/* Formulário centralizado, mas não influencia a logo */}
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 220px)" }}>
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center justify-center gap-4">
            <input
              type="email"
              className={`bg-[#373232] w-80 h-12 rounded-md text-center text-white hover:cursor-pointer ${error && !email ? 'border-2 border-red-500' : ''}`}
              placeholder={emailPlaceholder}
              onFocus={() => setEmailPlaceholder("")}
              onBlur={(e) => setEmailPlaceholder(e.target.value ? "" : "E-mail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className={`bg-[#373232] w-80 h-12 rounded-md text-center text-white hover:cursor-pointer ${error && !password ? 'border-2 border-red-500' : ''}`}
              placeholder={passwordPlaceholder}
              onFocus={() => setPasswordPlaceholder("")}
              onBlur={(e) => setPasswordPlaceholder(e.target.value ? "" : "Senha")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-[#E80000] w-80 h-12 rounded-md text-center text-white mt-4 hover:scale-105 transition-transform duration-200"
            >
              Entrar
            </button>
            <a href="#" className="text-white text-sm hover:underline mt-2 block text-center">
              Recuperar senha
            </a>
          </div>
          <div className="flex flex-col items-center gap-4 mt-4">
            <a
              className="text-white text-sm hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Cadastre-se aqui!
            </a>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;