import { Routes, Route } from 'react-router-dom';
import Header from "./components/header";
import HeroBanner from "./components/heroBanner";
import DetailsPage from './components/detailsPage';

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' element={<HeroBanner/>}/>
        <Route path='/detalhes/:id' element={<DetailsPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
