import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const UbicacionesTable = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data, error } = await supabase
        .from('ubicaciones')
        .select(`
          id,
          latitud,
          longitud,
          fecha_hora,
          user_id,
          tecnicos (
            nombre
          )
        `)
        .order('fecha_hora', { ascending: false });

      if (error) {
        console.error('Error al obtener ubicaciones:', error);
      } else {
        setUbicaciones(data);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <div>
      <h2>📍 Lista de ubicaciones registradas</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Latitud</th>
            <th>Longitud</th>
            <th>Fecha y Hora</th>
            <th>Técnico</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.map((ubic) => (
            <tr key={ubic.id}>
              <td>{ubic.id}</td>
              <td>{ubic.latitud}</td>
              <td>{ubic.longitud}</td>
              <td>{new Date(ubic.fecha_hora).toLocaleString()}</td>
              <td>{ubic.tecnicos?.nombre || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UbicacionesTable;
