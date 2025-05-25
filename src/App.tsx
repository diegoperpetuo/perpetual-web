import { Routes, Route, useLocation } from 'react-router-dom';
import Header from "./components/header";
import DetailsPage from './components/detailsPage';
import HomePage from './components/homePage';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import ProfilePage from './pages/profilePage';


function App() {

  const location = useLocation();
  
  const hideHeader = ['/login', '/register'];
  const shouldShowHeader = !hideHeader.includes(location.pathname);

  return (
    <div>
      {shouldShowHeader && <Header/>}
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path="/detalhes/:media_type/:id" element={<DetailsPage />} />
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/profile' element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
