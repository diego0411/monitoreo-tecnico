import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

const TareasTable = () => {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [proyectoFiltro, setProyectoFiltro] = useState('');
  const [observacionEdit, setObservacionEdit] = useState({});
  const [tecnicosAsignados, setTecnicosAsignados] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

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

  const quitarTecnico = async (tareaId, tecnicoId) => {
    await supabase.from('tarea_tecnicos').delete().eq('tarea_id', tareaId).eq('tecnico_id', tecnicoId);
    cargarDatos();
  };

  const obtenerNombresTecnicos = (tareaId) => {
    const ids = tecnicosAsignados[tareaId] || [];
    const nombres = tecnicos.filter(t => ids.includes(t.tecnico_id)).map(t => t.nombre);
    return nombres.length > 0 ? nombres.join(', ') : '—';
  };

  const tareasFiltradas = proyectoFiltro
    ? tareas.filter((t) => String(t.proyecto_id) === String(proyectoFiltro))
    : tareas;

  return (
    <div style={{ padding: '20px' }}>
      <h2>📋 Lista de Tareas</h2>

      <div>
        <label>🔍 Filtrar por proyecto:</label>
        <select
          value={proyectoFiltro}
          onChange={(e) => setProyectoFiltro(e.target.value)}
          style={{ marginBottom: '1rem' }}
        >
          <option value="">Todos los Proyectos</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

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

export default TareasTable;
