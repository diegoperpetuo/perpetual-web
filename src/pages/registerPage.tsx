import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../components/authHeader'; //

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailPlaceholder, setEmailPlaceholder] = useState("E-mail");
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("Senha");
  const [userPlaceholder, setUserPlaceholder] = useState("Usuário");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!username || !email || !password) {
      setError('Preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao registrar.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Usuário registrado com sucesso! Redirecionando para login...');
      setUsername('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Falha na requisição de registro:', err);
      setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E1A1A] w-screen h-screen relative">
      <AuthHeader variant='register' />
      <div className="w-80 flex items-center justify-center mx-auto pt-24">
        <img src="/logo.png" alt="logo" />
      </div>
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 220px)" }}>
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center justify-center gap-4">
            <input
              type="text"
              className="bg-[#373232] w-80 h-12 rounded-md text-center text-white"
              placeholder={userPlaceholder}
              onFocus={() => setUserPlaceholder("")}
              onBlur={(e) => setUserPlaceholder(e.target.value ? "" : "Usuário")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <input
              type="email"
              className="bg-[#373232] w-80 h-12 rounded-md text-center text-white"
              placeholder={emailPlaceholder}
              onFocus={() => setEmailPlaceholder("")}
              onBlur={(e) => setEmailPlaceholder(e.target.value ? "" : "E-mail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              className="bg-[#373232] w-80 h-12 rounded-md text-center text-white"
              placeholder={passwordPlaceholder}
              onFocus={() => setPasswordPlaceholder("")}
              onBlur={(e) => setPasswordPlaceholder(e.target.value ? "" : "Senha")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-[#E80000] w-80 h-12 rounded-md text-center text-white mt-4 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm mt-4">{successMessage}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;