import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';

const FormularioTarea = ({ onTareaGuardada }) => {
  const [form, setForm] = useState({
    nombre: '',
    duracion: '',
    fecha_inicio: '',
    fecha_fin: '',
    proyecto_id: '',
    estado: 'pendiente',
    observacion: ''
  });

  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    const cargarProyectos = async () => {
      const { data } = await supabase.from('proyectos').select('id, nombre');
      setProyectos(data || []);
    };
    cargarProyectos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tareas').insert([form]);

    if (error) {
      alert('❌ Error al guardar tarea');
      console.error(error);
    } else {
      alert('✅ Tarea registrada correctamente');
      setForm({
        nombre: '',
        duracion: '',
        fecha_inicio: '',
        fecha_fin: '',
        proyecto_id: '',
        estado: 'pendiente',
        observacion: ''
      });
      if (onTareaGuardada) onTareaGuardada(); // Callback para refrescar si se usa
    }
  };

  return (
    <div>
      <h2>📝 Registro de Tarea</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la tarea"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="duracion"
          placeholder="Duración (ej. 7 días)"
          value={form.duracion}
          onChange={handleChange}
        />
        <input
          type="date"
          name="fecha_inicio"
          value={form.fecha_inicio}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fecha_fin"
          value={form.fecha_fin}
          onChange={handleChange}
        />
        <select
          name="proyecto_id"
          value={form.proyecto_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un proyecto</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          style={{ marginTop: '1rem' }}
        >
          <option value="pendiente">Pendiente</option>
          <option value="completa">Completa</option>
        </select>

        <textarea
          name="observacion"
          placeholder="Observaciones (opcional)"
          value={form.observacion}
          onChange={handleChange}
          rows="3"
          style={{ width: '100%', marginTop: '1rem' }}
        />

        <button type="submit" style={{ marginTop: '1rem' }}>
          Guardar Tarea
        </button>
      </form>
    </div>
  );
};

export default FormularioTarea;
