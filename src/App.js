import React, { useState } from 'react';
import UbicacionesTable from './components/UbicacionesTable';
import Proyectos from './components/Proyectos';
import Tareas from './components/Tareas'; // 👈 Importar componente de tareas

function App() {
  const [vista, setVista] = useState('ubicaciones');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 Dashboard</h1>

      <nav style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => setVista('ubicaciones')} style={{ marginRight: '1rem' }}>
          📍 Ver Ubicaciones
        </button>
        <button onClick={() => setVista('proyectos')} style={{ marginRight: '1rem' }}>
          📁 Ver Proyectos
        </button>
        <button onClick={() => setVista('tareas')}>
          📝 Ver Tareas
        </button>
      </nav>

      {vista === 'ubicaciones' && <UbicacionesTable />}
      {vista === 'proyectos' && <Proyectos />}
      {vista === 'tareas' && <Tareas />}
    </div>
  );
}

export default App;
