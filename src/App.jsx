import React, { useRef } from 'react'
import './App.css'
import carro from './assets/carro.volkswagen.png'


function App() {


  return (

    <nav>

      <ul>

        <li>
          <a href="index.html">MENU</a>
        </li>

        <li>
          <a href="contato.html">CONTATO</a>
        </li>

        <li>
          <a href="sobre.html">SOBRE</a>
        </li>

        <li>
          <a href="app.html">APP</a>

        </li>

      </ul>

      <div className='produtos'>

        <h3>Fox</h3>

        <img className='carro' src={carro} alt="carro" />

        <button className='comprar'><a href="pagamento">COMPRAR</a></button>


      </div>

    </nav>

  )
}

export default App