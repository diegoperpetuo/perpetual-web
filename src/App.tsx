import { Routes, Route } from 'react-router-dom';
import Header from "./components/header";
import HeroBanner from "./components/heroBanner";
import Details from "./components/detailsPage";

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path='/' element={<HeroBanner/>}/>
        <Route path='/detalhes/:id' element={<Details/>}/>
      </Routes>
    </div>
  );
}

export default App;
