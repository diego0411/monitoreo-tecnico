import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

const ProyectosTable = () => {
  const [proyectos, setProyectos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});

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

  const quitarTecnico = async (proyecto_id, tecnico_id) => {
    await supabase
      .from('proyecto_tecnicos')
      .delete()
      .eq('proyecto_id', proyecto_id)
      .eq('tecnico_id', tecnico_id);

    setAsignaciones(prev => {
      const nuevo = { ...prev };
      nuevo[proyecto_id] = nuevo[proyecto_id]?.filter(id => id !== tecnico_id);
      return nuevo;
    });
  };

  return (
    <div>
      <h2>📋 Lista de Proyectos</h2>
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
                          <button onClick={() => quitarTecnico(p.id, t.tecnico_id)}>🗑️</button>
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

export default ProyectosTable;
