import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

const UbicacionesTable = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  // 📍 Lista de coordenadas personalizadas
  const ubicacionesPersonalizadas = [
    {
      nombre: "Integrat360 S.R.L",
      lat: -17.747144,
      lon: -63.153264,
      tolerancia: 0.1, /// 1 km de margen
    },
    {
      nombre: "Banco Economico",
      lat: -17.78439868334796,
      lon: -63.18304543040687,
      tolerancia: 0.1, /// 1 km de margen
    },
    
  ];
  

  // ✅ Verifica si las coordenadas coinciden con una ubicación personalizada
  const buscarNombrePersonalizado = (lat, lon) => {
    for (const ubic of ubicacionesPersonalizadas) {
      const dentroDelRango =
        Math.abs(lat - ubic.lat) <= ubic.tolerancia &&
        Math.abs(lon - ubic.lon) <= ubic.tolerancia;
      if (dentroDelRango) {
        return ubic.nombre;
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
    const nombrePersonalizado = buscarNombrePersonalizado(lat, lon);
    if (nombrePersonalizado) return nombrePersonalizado;

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

  // ✅ Obtiene ubicaciones y convierte coordenadas en direcciones o nombres personalizados
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
        const datosConDireccion = await Promise.all(
          data.map(async (ubic) => {
            const direccion = await obtenerDireccion(ubic.latitud, ubic.longitud);
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
