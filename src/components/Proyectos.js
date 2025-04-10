import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [form, setForm] = useState({
    nombre: '',
    duracion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [asignacion, setAsignacion] = useState({
    tecnico_id: '',
    proyecto_id: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchDatos = async () => {
      const { data: proyectosData } = await supabase.from('proyectos').select('*');
      const { data: tecnicosData } = await supabase.from('tecnicos').select('tecnico_id, nombre');
      const { data: relacionesData } = await supabase.from('proyecto_tecnicos').select('*');

      const agrupado = {};
      relacionesData?.forEach(rel => {
        if (!agrupado[rel.proyecto_id]) agrupado[rel.proyecto_id] = [];
        agrupado[rel.proyecto_id].push(rel.tecnico_id);
      });

      setProyectos(proyectosData || []);
      setTecnicos(tecnicosData || []);
      setAsignaciones(agrupado);
    };

    fetchDatos();
  }, []);

  const refreshAsignaciones = async () => {
    const { data: relacionesData } = await supabase.from('proyecto_tecnicos').select('*');
    const agrupado = {};
    relacionesData?.forEach(rel => {
      if (!agrupado[rel.proyecto_id]) agrupado[rel.proyecto_id] = [];
      agrupado[rel.proyecto_id].push(rel.tecnico_id);
    });
    setAsignaciones(agrupado);
  };

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
    }
  };

  const asignarTecnico = async () => {
    if (!asignacion.tecnico_id || !asignacion.proyecto_id)
      return alert('Selecciona técnico y proyecto');

    const yaAsignado = asignaciones[asignacion.proyecto_id]?.includes(asignacion.tecnico_id);
    if (yaAsignado) return alert('⚠️ Técnico ya asignado a ese proyecto');

    const { error } = await supabase.from('proyecto_tecnicos').insert([asignacion]);
    if (error) {
      console.error('Error al asignar técnico:', error);
      return;
    }

    await refreshAsignaciones();
    setAsignacion({ tecnico_id: '', proyecto_id: '' });
  };

  const quitarTecnico = async (proyecto_id, tecnico_id) => {
    const { error } = await supabase
      .from('proyecto_tecnicos')
      .delete()
      .eq('proyecto_id', proyecto_id)
      .eq('tecnico_id', tecnico_id);

    if (error) {
      console.error('Error al quitar técnico:', error);
      return;
    }

    await refreshAsignaciones();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📁 Registro de Proyectos</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Duración (ej. 30 días)"
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
        <button type="submit">Guardar</button>
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

      <h3>📋 Lista de proyectos</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Duración</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Técnicos asignados</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => {
            const tecnicosAsignados = tecnicos.filter((t) =>
              asignaciones[p.id]?.includes(t.tecnico_id)
            );
            return (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.duracion}</td>
                <td>{p.fecha_inicio}</td>
                <td>{p.fecha_fin}</td>
                <td>
                  {tecnicosAsignados.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                      {tecnicosAsignados.map((t) => (
                        <li key={t.tecnico_id}>
                          {t.nombre}{' '}
                          <button
                            onClick={() => quitarTecnico(p.id, t.tecnico_id)}
                            style={{ marginLeft: 8 }}
                          >
                            🗑️
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <i>— Sin técnicos asignados —</i>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Proyectos;
