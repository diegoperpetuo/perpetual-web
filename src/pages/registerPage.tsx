import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [emailPlaceholder, setEmailPlaceholder] = useState("E-mail");
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("Senha");
  const [userPlaceholder, setUserPlaceholder] = useState("Usuário");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulação de cadastro
    if (!username || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    // Aqui você pode simular um cadastro bem-sucedido
    // Por exemplo, salvar um "token" fake e redirecionar
    localStorage.setItem('token', 'fake-jwt-token');
    navigate('/');
  };

  return (
    <div className="bg-[#1E1A1A] w-screen h-screen flex flex-col items-center justify-center gap-y-12">
      <div className='w-full flex flex-row items-center justify-center gap-4'>
        <a
          className="absolute top-4 left-4 text-white text-sm hover:underline cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Voltar para o login
        </a>
        <div className="w-80 flex items-center justify-center">
          <img src="/logo.png" alt="logo" />
        </div>
      </div>

      <div className="flex flex-col">
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
            />
            <input
              type="text"
              className="bg-[#373232] w-80 h-12 rounded-md text-center text-white"
              placeholder={emailPlaceholder}
              onFocus={() => setEmailPlaceholder("")}
              onBlur={(e) => setEmailPlaceholder(e.target.value ? "" : "E-mail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="bg-[#373232] w-80 h-12 rounded-md text-center text-white"
              placeholder={passwordPlaceholder}
              onFocus={() => setPasswordPlaceholder("")}
              onBlur={(e) => setPasswordPlaceholder(e.target.value ? "" : "Senha")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button className="bg-[#E80000] w-80 h-12 rounded-md text-center text-white mt-4 hover:scale-105 transition-transform duration-200">
              Cadastrar
            </button>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;