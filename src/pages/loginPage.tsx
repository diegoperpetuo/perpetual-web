import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../components/authHeader'; //
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function LoginPage() {
  const [emailPlaceholder, setEmailPlaceholder] = useState("E-mail");
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("Senha");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login.');
        setLoading(false);
        return;
      }

      if (data.token) {
        login(data.token);
        console.log('Login successful, token:', data.token);
        navigate('/');
      } else {
        setError('Token não recebido do servidor.');
      }
    } catch (err) {
      console.error('Falha na requisição de login:', err);
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E1A1A] w-screen h-screen relative">
      <AuthHeader variant='login' />
      <div className="w-80 flex items-center justify-center mx-auto pt-24">
        <img src="/logo.png" alt="logo" />
      </div>
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-[#E80000] w-80 h-12 rounded-md text-center text-white mt-4 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
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