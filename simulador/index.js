import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'energia',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Plantas configuradas
const plantas = [
  { id: 'SOLAR_01', tipo: 'SOLAR' },
  { id: 'SOLAR_02', tipo: 'SOLAR' },
  { id: 'EOLICA_01', tipo: 'EOLICA' },
  { id: 'EOLICA_02', tipo: 'EOLICA' }
];

// Variables para simular curvas matemáticas (día de 24 "horas" simuladas en corto tiempo)
let simulandoHora = 6; // Iniciamos a las 6 AM

function generarDatosRealistas(planta) {
  const horaActual = Date.now(); // Timestamp real para TimescaleDB
  // Usamos una ola senoidal para la temperatura y radiación, donde el pico es al mediodía (12-14 hrs)

  // Normalizar la hora del día en radianes: 6 AM = -PI/2, 12 M = 0, 18 PM = PI/2
  const horaNormalizada = (simulandoHora - 12) * (Math.PI / 12);

  let radiacion_solar = 0;
  let temperatura = 15; // base nocturnal
  let viento = 5 + Math.random() * 15; // Viento "aleatorio controlado" estandar 
  let produccion_kw = 0;

  if (planta.tipo === 'SOLAR') {
    // Si de día (aprox entre 6am y 6pm), hay radiación
    if (simulandoHora >= 6 && simulandoHora <= 18) {
      radiacion_solar = Math.max(0, 1000 * Math.cos(horaNormalizada));
      temperatura = 15 + (15 * Math.cos(horaNormalizada)) + (Math.random() * 2); // Hasta 30+ grados de dia
      produccion_kw = radiacion_solar * 0.8 + (Math.random() * 50); // Mínimo de ruido
    } else {
      radiacion_solar = 0;
      temperatura = 15 - Math.random() * 3; // Baja temperatura en noche
      produccion_kw = 0;
    }
  } else if (planta.tipo === 'EOLICA') {
    // Eólica: Viento más fuerte de noche usualmente, pero aquí un modelo aleatorio realista
    // Producción basada en viento al cubo (simplificado)
    viento = 10 + (5 * Math.sin(horaNormalizada + Math.PI)) + Math.random() * 10;

    temperatura = 15 + (10 * Math.cos(horaNormalizada)); // Temperatura ambiental normal

    if (viento > 4 && viento < 25) {
      produccion_kw = (viento * 50) + (Math.random() * 20);
    } else {
      // Cut-in o cut-out speed (si no hay viento o hay demasiado, apagan aspas)
      produccion_kw = 0;
    }
  }

  // Avanzar la hora simulada gradualmente
  simulandoHora += 0.1;
  if (simulandoHora >= 24) simulandoHora = 0;

  return {
    timestamp: new Date(horaActual).toISOString(),
    planta_id: planta.id,
    tipo_fuente: planta.tipo,
    produccion_kw: Math.round(produccion_kw * 100) / 100,
    velocidad_viento: Math.round(viento * 100) / 100,
    radiacion_solar: Math.round(radiacion_solar * 100) / 100,
    temperatura: Math.round(temperatura * 100) / 100
  };
}

async function insertarDato(dato) {
  const query = `
    INSERT INTO mediciones (timestamp, planta_id, tipo_fuente, produccion_kw, velocidad_viento, radiacion_solar, temperatura)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [
    dato.timestamp, dato.planta_id, dato.tipo_fuente,
    dato.produccion_kw, dato.velocidad_viento,
    dato.radiacion_solar, dato.temperatura
  ];

  try {
    await pool.query(query, values);
    console.log(`[${dato.timestamp}] 📡 Datos insertados para ${dato.planta_id} | Prod: ${dato.produccion_kw}kW | Rad: ${dato.radiacion_solar}W/m2 | Temp: ${dato.temperatura}°C`);
  } catch (error) {
    console.error(' Error al insertar datos:', error.message);
  }
}

async function iniciarSimulacion() {
  console.log(' Iniciando simulador IoT de Energía Renovable...');

  // Probar conexión a la DB
  try {
    const cliente = await pool.connect();
    console.log('✅ Conexión exitosa a TimescaleDB!');
    cliente.release();
  } catch (err) {
    console.error('❌ No se pudo conectar a la DB. Asegúrate de que los contenedores de Docker estén corriendo.', err.message);
    process.exit(1);
  }

  // Bucle de sensores simulados (ejecuta cada 2.5 segundos)
  setInterval(() => {
    plantas.forEach(planta => {
      const datos = generarDatosRealistas(planta);
      insertarDato(datos);
    });
  }, 2500); // 2.5 segundos de intervalo real
}

iniciarSimulacion();
