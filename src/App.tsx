import { Routes, Route } from 'react-router-dom';
import Header from "./components/header";
import DetailsPage from './components/detailsPage';
import HomePage from './components/homePage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';


function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path="/detalhes/:media_type/:id" element={<DetailsPage />} />
      </Routes>
    </div>
  );
}

export default App;
