import React, { useState } from 'react';
import FormularioUbicacion from './FormularioUbicacion';
import FormularioTarea from './FormularioTarea';
import FormularioProyecto from './FormularioProyecto'; // ✅ Importar

const RegistroGeneral = () => {
  const [formularioActivo, setFormularioActivo] = useState('ubicacion');

  return (
    <div>
      <h2>📝 Registro de Datos</h2>

      <nav style={{ marginBottom: '1rem' }}>
        <button onClick={() => setFormularioActivo('ubicacion')} style={{ marginRight: '0.5rem' }}>
          📍 Ubicación
        </button>
        <button onClick={() => setFormularioActivo('tarea')} style={{ marginRight: '0.5rem' }}>
          📝 Tarea
        </button>
        <button onClick={() => setFormularioActivo('proyecto')}>
          📁 Proyecto
        </button>
      </nav>

      {formularioActivo === 'ubicacion' && <FormularioUbicacion />}
      {formularioActivo === 'tarea' && <FormularioTarea />}
      {formularioActivo === 'proyecto' && <FormularioProyecto />}
    </div>
  );
};

export default RegistroGeneral;
