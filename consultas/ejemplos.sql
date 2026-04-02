-- 1. Producción energética por día (promedio)
SELECT time_bucket('1 day', timestamp) AS dia,
       AVG(produccion_kw) as produccion_promedio_kw
FROM mediciones
GROUP BY dia
ORDER BY dia DESC;

-- 2. Comparación de producción entre plantas
SELECT planta_id, tipo_fuente, 
       AVG(produccion_kw) as promedio_historico_kw,
       MAX(produccion_kw) as maximo_kw
FROM mediciones
GROUP BY planta_id, tipo_fuente
ORDER BY promedio_historico_kw DESC;

-- 3. Relación clima vs producción (Solar) en ventanas de 1 hora
SELECT time_bucket('1 hour', timestamp) AS hora,
       planta_id,
       AVG(radiacion_solar) as radiacion_media,
       AVG(temperatura) as temperatura_media,
       AVG(produccion_kw) as produccion_media
FROM mediciones
WHERE tipo_fuente = 'SOLAR'
GROUP BY hora, planta_id
ORDER BY hora DESC;

-- 4. Identificación de picos o caídas en la última hora (Eólica)
SELECT timestamp, planta_id, velocidad_viento, produccion_kw
FROM mediciones
WHERE tipo_fuente = 'EOLICA' 
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY velocidad_viento DESC;

-- 5. Últimas mediciones ingresadas en tiempo real
SELECT * FROM mediciones 
ORDER BY timestamp DESC 
LIMIT 10;
