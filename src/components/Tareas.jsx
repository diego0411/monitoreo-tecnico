import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [asignacion, setAsignacion] = useState({ tarea_id: '', tecnico_id: '' });
  const [tecnicosAsignados, setTecnicosAsignados] = useState({});
  const [proyectoFiltro, setProyectoFiltro] = useState('');
  const [form, setForm] = useState({
    nombre: '', duracion: '', fecha_inicio: '', fecha_fin: '',
    proyecto_id: '', estado: 'pendiente', observacion: ''
  });
  const [observacionEdit, setObservacionEdit] = useState({});

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    const { data: proyectosData } = await supabase.from('proyectos').select('id, nombre');
    const { data: tecnicosData } = await supabase.from('tecnicos').select('tecnico_id, nombre');
    const { data: tareasData } = await supabase
      .from('tareas')
      .select('id, nombre, duracion, fecha_inicio, fecha_fin, proyecto_id, estado, observacion, proyectos(nombre)')
      .order('fecha_inicio', { ascending: true });
    const { data: relaciones } = await supabase.from('tarea_tecnicos').select('*');

    const agrupado = {};
    relaciones?.forEach(rel => {
      if (!agrupado[rel.tarea_id]) agrupado[rel.tarea_id] = [];
      agrupado[rel.tarea_id].push(rel.tecnico_id);
    });

    setProyectos(proyectosData || []);
    setTecnicos(tecnicosData || []);
    setTareas(tareasData || []);
    setTecnicosAsignados(agrupado);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tareas').insert([form]);
    if (error) return alert('❌ Error al guardar tarea');
    alert('✅ Tarea registrada correctamente');
    setForm({
      nombre: '', duracion: '', fecha_inicio: '', fecha_fin: '',
      proyecto_id: '', estado: 'pendiente', observacion: ''
    });
    cargarDatos();
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', id);
    cargarDatos();
  };

  const actualizarObservacion = async (id) => {
    const nuevaObs = observacionEdit[id];
    await supabase.from('tareas').update({ observacion: nuevaObs }).eq('id', id);
    alert('📝 Observación actualizada');
    setObservacionEdit({ ...observacionEdit, [id]: '' });
    cargarDatos();
  };

  const asignarTecnico = async () => {
    const { tarea_id, tecnico_id } = asignacion;
    if (!tarea_id || !tecnico_id) return alert('Selecciona tarea y técnico');
    const yaAsignado = tecnicosAsignados[tarea_id]?.includes(tecnico_id);
    if (yaAsignado) return alert('⚠️ Técnico ya asignado a esta tarea');

    const { error } = await supabase.from('tarea_tecnicos').insert([{ tarea_id, tecnico_id }]);
    if (error) return console.error(error);
    setAsignacion({ tarea_id: '', tecnico_id: '' });
    cargarDatos();
  };

  const quitarTecnico = async (tareaId, tecnicoId) => {
    await supabase.from('tarea_tecnicos').delete().eq('tarea_id', tareaId).eq('tecnico_id', tecnicoId);
    cargarDatos();
  };

  const obtenerNombresTecnicos = (tareaId) => {
    const ids = tecnicosAsignados[tareaId] || [];
    const nombres = tecnicos.filter(t => ids.includes(t.tecnico_id)).map(t => t.nombre);
    return nombres.length > 0 ? nombres.join(', ') : '—';
  };

  // ✅ Filtro con conversión explícita para asegurar coincidencia de tipos
  const tareasFiltradas = proyectoFiltro
    ? tareas.filter((t) => String(t.proyecto_id) === String(proyectoFiltro))
    : tareas;

  return (
    <div style={{ padding: '20px' }}>
      <h2>📝 Registro de Tareas</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input type="text" name="nombre" placeholder="Nombre de la tarea" value={form.nombre} onChange={handleChange} required />
        <input type="text" name="duracion" placeholder="Duración (ej. 7 días)" value={form.duracion} onChange={handleChange} />
        <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
        <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
        <select name="proyecto_id" value={form.proyecto_id} onChange={handleChange} required>
          <option value="">Selecciona un proyecto</option>
          {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select name="estado" value={form.estado} onChange={handleChange} style={{ marginTop: '1rem' }}>
          <option value="pendiente">Pendiente</option>
          <option value="completa">Completa</option>
        </select>
        <textarea name="observacion" placeholder="Observaciones (opcional)" value={form.observacion} onChange={handleChange} rows="3" style={{ width: '100%', marginTop: '1rem' }} />
        <button type="submit" style={{ marginTop: '1rem' }}>Guardar Tarea</button>
      </form>

      <h3>🔍 Filtrar Tareas por Proyecto</h3>
      <select value={proyectoFiltro} onChange={(e) => setProyectoFiltro(e.target.value)} style={{ marginBottom: '1rem' }}>
        <option value="">Todos los Proyectos</option>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      <h3>👥 Asignar Técnico a Tarea</h3>
      <div style={{ marginBottom: '1rem' }}>
        <select value={asignacion.tecnico_id} onChange={(e) => setAsignacion({ ...asignacion, tecnico_id: e.target.value })}>
          <option value="">Seleccionar Técnico</option>
          {tecnicos.map((t) => <option key={t.tecnico_id} value={t.tecnico_id}>{t.nombre}</option>)}
        </select>
        <select value={asignacion.tarea_id} onChange={(e) => setAsignacion({ ...asignacion, tarea_id: e.target.value })}>
          <option value="">Seleccionar Tarea</option>
          {tareasFiltradas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <button onClick={asignarTecnico} style={{ marginLeft: '1rem' }}>Asignar Técnico</button>
      </div>

      <h3>📋 Lista de Tareas</h3>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th><th>Proyecto</th><th>Duración</th><th>Inicio</th><th>Fin</th><th>Estado</th>
            <th>Observación</th><th>Técnicos asignados</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tareasFiltradas.map((t) => (
            <tr key={t.id}>
              <td>{t.nombre}</td>
              <td>{t.proyectos?.nombre || '—'}</td>
              <td>{t.duracion}</td>
              <td>{t.fecha_inicio}</td>
              <td>{t.fecha_fin}</td>
              <td>{t.estado}</td>
              <td>
                <textarea
                  value={(observacionEdit[t.id] ?? t.observacion) || ''}
                  onChange={(e) => setObservacionEdit({ ...observacionEdit, [t.id]: e.target.value })}
                  rows="2"
                />
                <button onClick={() => actualizarObservacion(t.id)}>💾</button>
              </td>
              <td>
                {(tecnicosAsignados[t.id]?.length > 0)
                  ? (
                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                      {tecnicos
                        .filter(ti => tecnicosAsignados[t.id]?.includes(ti.tecnico_id))
                        .map((tec) => (
                          <li key={tec.tecnico_id}>
                            {tec.nombre} <button onClick={() => quitarTecnico(t.id, tec.tecnico_id)}>🗑️</button>
                          </li>
                        ))}
                    </ul>
                  ) : (<i>— Sin técnicos asignados —</i>)}
              </td>
              <td>
                <button onClick={() => actualizarEstado(t.id, t.estado === 'pendiente' ? 'completa' : 'pendiente')}>
                  {t.estado === 'pendiente' ? '✅' : '↩'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tareas;
