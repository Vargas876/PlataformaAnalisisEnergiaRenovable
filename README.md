# ⚡ Plataforma de Análisis de Energía Renovable IoT

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TimescaleDB](https://img.shields.io/badge/TimescaleDB-F0B800?style=for-the-badge&logo=timescaledb&logoColor=black)
![Grafana](https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

Plataforma de modelado, simulación y análisis de datos en tiempo real para plantas de energía renovable (Solares y Eólicas). Diseñada para superar las limitaciones de las bases de datos relacionales tradicionales ante las altas tasas de ingesta (Big Data) en sistemas IoT mediante el uso de Bases de Datos orientadas a **Series de Tiempo (Time-Series)**.

## 🚀 Arquitectura del Proyecto

El proyecto está compuesto por tres ejes fundamentales:

1. **Simulador de Datos IoT (Node.js):** 
   Un motor programado en JavaScript que utiliza matemáticas trigonométricas (Senos y Cosenos) para simular el comportamiento hiper-realista de plantas energéticas. Las plantas solares generan energía basada en la radiación como una campana de Gauss respecto a la hora del día, mientras que las eólicas tienen alta variabilidad caótica simulando ráfagas.
2. **Base de Datos Especializada:**
   **TimescaleDB** (basada en PostgreSQL). Utilizando el concepto de *Hypertable*, se particionan automáticamente los registros por el vector del tiempo (`timestamp`), permitiendo consultas analíticas veloces, independientemente de que se inyecten millones de registros.
3. **Plataforma de Observabilidad (Dashboards):**
   **Grafana** está conectado nativamente a la base de datos para ejecutar *queries* analíticos asíncronos y proyectar gráficos y reportes del rendimiento de las granjas en vivo.

## 📦 Estructura del Repositorio

```text
├── docker-compose.yml       # Orquestador de la infraestructura (TimescaleDB + Grafana)
├── db/
│   └── init.sql             # Autoconfiguración y creación de la Hypertable
├── simulador/
│   ├── .env.example         # Template de variables de entorno
│   ├── index.js             # Lógica matemática e inyección de datos (Data Stream Pipeline)
│   └── package.json         # Dependencias de Node.js (pg, dotenv)
└── consultas/
    └── ejemplos.sql         # Repositorio de consultas analíticas pesadas (time_bucket, promedios)
```

## 🛠️ Instalación y Despliegue

### Requisitos Previos
- [Docker](https://www.docker.com/) y Docker Compose instalados.
- [Node.js](https://nodejs.org/es/) (Versión 18 o superior).

### Paso a paso

1. **Levantar la Infraestructura:**
   Posiciónate en la carpeta raíz del proyecto y ejecuta:
   ```bash
   docker compose up -d
   ```
   Esto levantará los contenedores de TimescaleDB (puerto 5433 local) y Grafana (puerto 3000 local). La tabla se creará y optimizará automáticamente gracias al `init.sql`.

2. **Configurar el entorno del Simulador:**
   Entra a la carpeta `/simulador`, instala las dependencias y crea tu archivo `.env`:
   ```bash
   cd simulador
   npm install
   # Crea un archivo .env basándote en el formato:
   # DB_USER=postgres
   # DB_PASSWORD=postgres
   # DB_HOST=localhost
   # DB_PORT=5433
   # DB_NAME=energia
   ```

3. **Iniciar la Telemetría (Simulador):**
   Ejecuta el pipeline de inyección de datos:
   ```bash
   node index.js
   ```
   Verás en consola cómo las plantas comienzan a ingresar megavatios calculados en base a modelos climatológicos.

4. **Visualizar el Resultado:**
   Ve a [http://localhost:3000](http://localhost:3000) en tu navegador.
   - **Usuario:** `admin` | **Clave:** `admin`
   - Agrega la conexión *PostgreSQL* apuntando a `timescaledb:5432` *(interna del contenedor)*.
   - ¡Crea tu primer Dashboard en formato *Time-Series*!

## 🔧 Casos de Uso Analíticos

Encuentra en `consultas/ejemplos.sql` procesos como:
- Uso de `time_bucket()` masivo para evaluar productividad en distintas franjas horarias.
- Extracción de tendencias e impacto del clima (temperatura/viento) sobre el rendimiento (kW).
- Queries de Alerta Temprana frente a ráfagas de viento peligrosas (velocidad de viento excesiva).

---
*Desarrollado para la electiva de la Universidad - Plataforma Base de Datos para Series de Tiempo.*
