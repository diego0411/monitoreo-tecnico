import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

const UbicacionesTable = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  // ✅ Verifica si las coordenadas coinciden con una zona controlada de Supabase
  const buscarNombreZona = (lat, lon, zonas) => {
    for (const zona of zonas) {
      const dentroDelRango =
        Math.abs(lat - zona.lat) <= zona.tolerancia &&
        Math.abs(lon - zona.lon) <= zona.tolerancia;
      if (dentroDelRango) {
        return zona.nombre;
      }
    }
    return null;
  };

  // ✅ Formatea la fecha como en Supabase (UTC)
  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toISOString().replace('T', ' ').slice(0, 19);
  };

  // ✅ Obtiene dirección desde latitud y longitud o devuelve nombre personalizado
  const obtenerDireccion = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const dir = data.address;

      const direccionFormateada = [
        dir.road,
        dir.neighbourhood,
        dir.suburb,
        dir.city,
        dir.state,
        dir.country,
      ]
        .filter(Boolean)
        .join(', ');

      return direccionFormateada || 'Dirección no encontrada';
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      return 'Error de geolocalización';
    }
  };

  // ✅ Obtiene ubicaciones y convierte coordenadas en direcciones o zonas
  useEffect(() => {
    const obtenerDatos = async () => {
      // 🗺️ Obtener zonas controladas desde Supabase
      const { data: zonas, error: errorZonas } = await supabase
        .from('zonas_controladas')
        .select('nombre, lat, lon, tolerancia');

      if (errorZonas) {
        console.error('Error al obtener zonas controladas:', errorZonas);
        return;
      }

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
        const datosConDireccion = await Promise.all(
          data.map(async (ubic) => {
            const nombreZona = buscarNombreZona(ubic.latitud, ubic.longitud, zonas);
            const direccion = nombreZona || await obtenerDireccion(ubic.latitud, ubic.longitud);
            return { ...ubic, direccion };
          })
        );
        setUbicaciones(datosConDireccion);
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
            <th>Dirección / Punto</th>
            <th>Fecha y Hora (UTC)</th>
            <th>Técnico</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.map((ubic) => (
            <tr key={ubic.id}>
              <td>{ubic.id}</td>
              <td>{ubic.direccion}</td>
              <td>{formatearFecha(ubic.fecha_hora)}</td>
              <td>{ubic.tecnicos?.nombre || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UbicacionesTable;
