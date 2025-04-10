import React, { useState } from 'react';
import RegistroGeneral from './components/registro/RegistroGeneral';
import ListasGenerales from './components/listas/ListasGenerales';
import './App.css';

function App() {
  const [vista, setVista] = useState('registro');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 Dashboard</h1>

      <nav style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => setVista('registro')} style={{ marginRight: '1rem' }}>
          📝 Registro
        </button>
        <button onClick={() => setVista('listas')} style={{ marginRight: '1rem' }}>
          📋 Ver Listas
        </button>
      </nav>

      {vista === 'registro' && <RegistroGeneral />}
      {vista === 'listas' && <ListasGenerales />}
    </div>
  );
}

export default App;
