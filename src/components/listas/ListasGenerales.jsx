import React, { useState } from 'react';
import UbicacionesTable from './UbicacionesTable';
import TareasTable from './TareasTable';
import ProyectosTable from './ProyectosTable'; // ✅ Importar

const ListasGenerales = () => {
  const [listaActiva, setListaActiva] = useState('ubicaciones');

  return (
    <div>
      <h2>📋 Listas de Registros</h2>

      <nav style={{ marginBottom: '1rem' }}>
        <button onClick={() => setListaActiva('ubicaciones')} style={{ marginRight: '0.5rem' }}>
          📍 Ubicaciones
        </button>
        <button onClick={() => setListaActiva('tareas')} style={{ marginRight: '0.5rem' }}>
          📝 Tareas
        </button>
        <button onClick={() => setListaActiva('proyectos')}>
          📁 Proyectos
        </button>
      </nav>

      {listaActiva === 'ubicaciones' && <UbicacionesTable />}
      {listaActiva === 'tareas' && <TareasTable />}
      {listaActiva === 'proyectos' && <ProyectosTable />}
    </div>
  );
};

export default ListasGenerales;
