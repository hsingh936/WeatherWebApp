import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import City from './Components/City';
import Weather from './Components/Weather';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<City />} />
        <Route path="/weather/:cityName" element={<Weather />} />
      </Routes>
    </Router>
  );
};

export default App;
