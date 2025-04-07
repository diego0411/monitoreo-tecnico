import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    duracion: '',
    fecha_inicio: '',
    fecha_fin: '',
    proyecto_id: '',
    tecnico_ids: [],
    estado: 'pendiente',
    observacion: ''
  });
  const [observacionEdit, setObservacionEdit] = useState({});
  const [asignaciones, setAsignaciones] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const { data: proyectosData } = await supabase.from('proyectos').select('id, nombre');
    const { data: tecnicosData } = await supabase.from('tecnicos').select('tecnico_id, nombre');

    const { data: tareasData, error } = await supabase
      .from('tareas')
      .select(`
        id,
        nombre,
        duracion,
        fecha_inicio,
        fecha_fin,
        proyecto_id,
        estado,
        observacion,
        proyectos ( nombre ),
        tarea_tecnicos ( tecnico_id )
      `)
      .order('fecha_inicio', { ascending: true });

    const asignados = {};
    tareasData?.forEach(t => {
      asignados[t.id] = t.tarea_tecnicos?.map(x => x.tecnico_id) || [];
    });

    setProyectos(proyectosData || []);
    setTecnicos(tecnicosData || []);
    setTareas(tareasData || []);
    setAsignaciones(asignados);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (id) => {
    const seleccionados = form.tecnico_ids.includes(id)
      ? form.tecnico_ids.filter((tid) => tid !== id)
      : [...form.tecnico_ids, id];
    setForm({ ...form, tecnico_ids: seleccionados });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: nuevaTarea, error } = await supabase
      .from('tareas')
      .insert([form])
      .select()
      .single();

    if (error) {
      alert('❌ Error al guardar tarea');
      console.error(error);
      return;
    }

    if (form.tecnico_ids.length > 0) {
      const asignaciones = form.tecnico_ids.map((tecnico_id) => ({
        tarea_id: nuevaTarea.id,
        tecnico_id
      }));
      await supabase.from('tarea_tecnicos').insert(asignaciones);
    }

    alert('✅ Tarea registrada correctamente');

    setForm({
      nombre: '',
      duracion: '',
      fecha_inicio: '',
      fecha_fin: '',
      proyecto_id: '',
      tecnico_ids: [],
      estado: 'pendiente',
      observacion: ''
    });

    cargarDatos();
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('tareas')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) cargarDatos();
  };

  const actualizarObservacion = async (id) => {
    const nuevaObs = observacionEdit[id];
    const { error } = await supabase
      .from('tareas')
      .update({ observacion: nuevaObs })
      .eq('id', id);

    if (!error) {
      alert('📝 Observación actualizada');
      setObservacionEdit({ ...observacionEdit, [id]: '' });
      cargarDatos();
    }
  };

  const toggleTecnico = async (tareaId, tecnicoId) => {
    const yaAsignado = asignaciones[tareaId]?.includes(tecnicoId);

    if (yaAsignado) {
      await supabase
        .from('tarea_tecnicos')
        .delete()
        .eq('tarea_id', tareaId)
        .eq('tecnico_id', tecnicoId);
    } else {
      await supabase.from('tarea_tecnicos').insert([{ tarea_id: tareaId, tecnico_id: tecnicoId }]);
    }

    cargarDatos();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📝 Registro de Tareas</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
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

        <textarea
          name="observacion"
          placeholder="Observaciones (opcional)"
          value={form.observacion}
          onChange={handleChange}
          rows="3"
          style={{ width: '100%', marginTop: '1rem' }}
        />

        <fieldset style={{ marginTop: '1rem' }}>
          <legend>Asignar Técnicos</legend>
          {tecnicos.map((t) => (
            <label key={t.tecnico_id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={form.tecnico_ids.includes(t.tecnico_id)}
                onChange={() => handleCheckbox(t.tecnico_id)}
              />
              {t.nombre}
            </label>
          ))}
        </fieldset>

        <button type="submit" style={{ marginTop: '1rem' }}>Guardar Tarea</button>
      </form>

      <h3>📋 Lista de Tareas</h3>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Proyecto</th>
            <th>Duración</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Observación</th>
            <th>Técnicos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((t) => (
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
                <button onClick={() => actualizarObservacion(t.id)}>💾 Guardar</button>
              </td>
              <td>
                <fieldset style={{ maxHeight: 120, overflowY: 'auto' }}>
                  {tecnicos.map((tec) => (
                    <label key={tec.tecnico_id} style={{ display: 'block' }}>
                      <input
                        type="checkbox"
                        checked={asignaciones[t.id]?.includes(tec.tecnico_id) || false}
                        onChange={() => toggleTecnico(t.id, tec.tecnico_id)}
                      />
                      {tec.nombre}
                    </label>
                  ))}
                </fieldset>
              </td>
              <td>
                <button
                  onClick={() => actualizarEstado(t.id, t.estado === 'pendiente' ? 'completa' : 'pendiente')}
                >
                  {t.estado === 'pendiente' ? '✅ Completar' : '↩ Pendiente'}
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