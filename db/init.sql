-- Habilitar la extensión TimescaleDB si no está instalada
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Crear tabla de mediciones
CREATE TABLE IF NOT EXISTS mediciones (
    timestamp TIMESTAMP NOT NULL,
    planta_id TEXT NOT NULL,
    tipo_fuente TEXT NOT NULL,
    produccion_kw FLOAT NOT NULL,
    velocidad_viento FLOAT NOT NULL,
    radiacion_solar FLOAT NOT NULL,
    temperatura FLOAT NOT NULL
);

-- Convertir la tabla PostgreSQL estándar en una hypertable de TimescaleDB
-- Esto optimiza el almacenamiento y las consultas por tiempo.
SELECT create_hypertable('mediciones', 'timestamp', if_not_exists => TRUE);

-- Crear índices adicionales para mejorar consultas por planta o tipo
CREATE INDEX IF NOT EXISTS ix_planta_id ON mediciones (planta_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS ix_tipo_fuente ON mediciones (tipo_fuente, timestamp DESC);
