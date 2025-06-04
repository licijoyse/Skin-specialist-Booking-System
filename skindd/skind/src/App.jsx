import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Doctors from "./pages/Doctors";
import Doclog from "./pages/Doclog";
import Appointment from "./pages/Appointment";
import Chatbot from "./pages/Chatbot";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Doctors />} />
        <Route path="/doclog" element={<Doclog />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/chatbot" element={<Chatbot />} />
     
      </Routes>
    </BrowserRouter>
  );
}
export default App;
