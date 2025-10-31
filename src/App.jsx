import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";
import carro from "./assets/carro.volkswagen.png";

function Home() {
  const navigate = useNavigate();

  return (
    <nav>
      <ul className="menu">
        <li><a href="/">MENU</a></li>
        <li><a href="/contato">CONTATO</a></li>
        <li><a href="/sobre">SOBRE</a></li>
        <li><a href="/app">APP</a></li>
      </ul>

      <div className="produtos">
        <h3>Fox</h3>
        <img className="carro" src={carro} alt="carro" />

        <button className="comprar" onClick={() => navigate("/pagamento")}>
          COMPRAR
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pagamento" element={<Pagamento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

