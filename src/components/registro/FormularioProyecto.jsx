import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

const FormularioProyecto = ({ onProyectoGuardado }) => {
  const [form, setForm] = useState({
    nombre: '',
    duracion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const [tecnicos, setTecnicos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [asignacion, setAsignacion] = useState({
    tecnico_id: '',
    proyecto_id: ''
  });

  useEffect(() => {
    const fetchDatos = async () => {
      const { data: tecnicosData } = await supabase.from('tecnicos').select('tecnico_id, nombre');
      const { data: proyectosData } = await supabase.from('proyectos').select('*');
      const { data: relacionesData } = await supabase.from('proyecto_tecnicos').select('*');

      const agrupado = {};
      relacionesData?.forEach(rel => {
        if (!agrupado[rel.proyecto_id]) agrupado[rel.proyecto_id] = [];
        agrupado[rel.proyecto_id].push(rel.tecnico_id);
      });

      setTecnicos(tecnicosData || []);
      setProyectos(proyectosData || []);
      setAsignaciones(agrupado);
    };

    fetchDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('proyectos').insert([form]);

    if (error) {
      alert('❌ Error al guardar proyecto');
      console.error(error);
    } else {
      alert('✅ Proyecto registrado');
      setForm({ nombre: '', duracion: '', fecha_inicio: '', fecha_fin: '' });
      const { data: nuevos } = await supabase.from('proyectos').select('*');
      setProyectos(nuevos || []);
      if (onProyectoGuardado) onProyectoGuardado();
    }
  };

  const refreshAsignaciones = async () => {
    const { data: relacionesData } = await supabase.from('proyecto_tecnicos').select('*');
    const agrupado = {};
    relacionesData?.forEach(rel => {
      if (!agrupado[rel.proyecto_id]) agrupado[rel.proyecto_id] = [];
      agrupado[rel.proyecto_id].push(rel.tecnico_id);
    });
    setAsignaciones(agrupado);
  };

  const asignarTecnico = async () => {
    if (!asignacion.tecnico_id || !asignacion.proyecto_id)
      return alert('Selecciona técnico y proyecto');

    const yaAsignado = asignaciones[asignacion.proyecto_id]?.includes(asignacion.tecnico_id);
    if (yaAsignado) return alert('⚠️ Técnico ya asignado a ese proyecto');

    const { error } = await supabase.from('proyecto_tecnicos').insert([asignacion]);
    if (error) return console.error('Error al asignar técnico:', error);

    await refreshAsignaciones();
    setAsignacion({ tecnico_id: '', proyecto_id: '' });
  };

  return (
    <div>
      <h2>📁 Registro de Proyecto</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Duración"
          value={form.duracion}
          onChange={(e) => setForm({ ...form, duracion: e.target.value })}
        />
        <input
          type="date"
          value={form.fecha_inicio}
          onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.fecha_fin}
          onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
        />
        <button type="submit">Guardar Proyecto</button>
      </form>

      <hr />

      <h3>👥 Asignar Técnico a Proyecto</h3>
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={asignacion.tecnico_id}
          onChange={(e) => setAsignacion({ ...asignacion, tecnico_id: e.target.value })}
        >
          <option value="">Seleccionar Técnico</option>
          {tecnicos.map((t) => (
            <option key={t.tecnico_id} value={t.tecnico_id}>{t.nombre}</option>
          ))}
        </select>
        <select
          value={asignacion.proyecto_id}
          onChange={(e) => setAsignacion({ ...asignacion, proyecto_id: e.target.value })}
        >
          <option value="">Seleccionar Proyecto</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <button onClick={asignarTecnico} style={{ marginLeft: '1rem' }}>Asignar Técnico</button>
      </div>
    </div>
  );
};

export default FormularioProyecto;
