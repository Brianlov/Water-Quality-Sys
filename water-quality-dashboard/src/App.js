// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sensorboard from './sensorboard';
import Home from './Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sensorboard" element={<Sensorboard />} />
      </Routes>
    </Router>
  );
}

export default App;
