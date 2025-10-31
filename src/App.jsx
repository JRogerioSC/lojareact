import React from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'
import carro from './assets/carro.volkswagen.png'

function App() {
  const navigate = useNavigate()

  return (
    <nav>
      <ul>
        <li><a href="#">MENU</a></li>
        <li><a href="#">CONTATO</a></li>
        <li><a href="#">SOBRE</a></li>
        <li><a href="#">APP</a></li>
      </ul>

      <div className="produtos">
        <h3>Fox</h3>
        <img className="carro" src={carro} alt="carro" />

        <button
          className="comprar"
          onClick={() => navigate('/pagamento')}
        >
          COMPRAR
        </button>
      </div>
    </nav>
  )
}

export default App
