import React, { useState } from 'react';
import { supabase } from '../../supabase/client';

const FormularioUbicacion = () => {
  const [nombre, setNombre] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [tolerancia, setTolerancia] = useState('');
  const [mensaje, setMensaje] = useState('');

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      return alert('🌐 Geolocalización no disponible en este navegador');
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLon(position.coords.longitude.toFixed(6));
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('❌ No se pudo obtener la ubicación');
      }
    );
  };

  const guardarUbicacion = async (e) => {
    e.preventDefault();

    if (!nombre || !lat || !lon || !tolerancia) {
      setMensaje('Por favor, completa todos los campos.');
      return;
    }

    const { error } = await supabase.from('ubicaciones').insert([
      {
        nombre,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        tolerancia: parseFloat(tolerancia),
      },
    ]);

    if (error) {
      console.error(error);
      setMensaje('Error al guardar la ubicación.');
    } else {
      setMensaje('Ubicación guardada exitosamente.');
      setNombre('');
      setLat('');
      setLon('');
      setTolerancia('');
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>📍 Registrar Nueva Ubicación</h2>
      <form onSubmit={guardarUbicacion}>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Latitud:</label>
        <input
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          required
        />

        <label>Longitud:</label>
        <input
          type="number"
          step="any"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          required
        />

        <button type="button" onClick={obtenerUbicacion} style={{ marginBottom: '1rem' }}>
          📍 Obtener mi ubicación actual
        </button>

        <label>Tolerancia (km):</label>
        <input
          type="number"
          step="any"
          value={tolerancia}
          onChange={(e) => setTolerancia(e.target.value)}
          required
        />

        <button type="submit">Guardar</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default FormularioUbicacion;
