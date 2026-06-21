# MotoGo Rental Web — Frontend

Prototipo del frontend de **MotoGo Rental Web** construido con React + Vite + Tailwind CSS.

> **Estado actual:** prototipo con datos hardcodeados. El backend (Node.js + Express + MySQL) aún no está conectado. Cuando esté listo, basta con reemplazar los datos en `src/data/` por llamadas a la API.

## Stack

- **React 18** — librería principal
- **Vite** — bundler y servidor de desarrollo
- **Tailwind CSS** — utility-first styling
- **React Router** — navegación entre pantallas
- **lucide-react** — íconos

## Instalación

Requiere **Node.js 18 o superior**.

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Estructura del proyecto

```
motogo-frontend/
├── public/                       Archivos estáticos
├── src/
│   ├── components/               Componentes reutilizables
│   │   ├── Logo.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── VehicleCard.jsx
│   │   ├── VehicleIcon.jsx
│   │   ├── TopNav.jsx
│   │   ├── Footer.jsx
│   │   └── DemoNav.jsx
│   ├── pages/                    Pantallas (una por ruta)
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Catalog.jsx
│   │   ├── VehicleDetail.jsx
│   │   ├── Booking.jsx
│   │   ├── Confirmation.jsx
│   │   ├── ClientPanel.jsx
│   │   ├── OperatorPanel.jsx
│   │   └── AdminDashboard.jsx
│   ├── data/                     Datos hardcodeados (reemplazar por API)
│   │   ├── vehicles.js
│   │   └── reservations.js
│   ├── lib/                      Utilidades y constantes
│   │   ├── themes.js
│   │   └── format.js
│   ├── context/                  Context API para estado global
│   │   └── AuthContext.jsx
│   ├── App.jsx                   Routing principal
│   ├── main.jsx                  Entry point
│   └── index.css                 Tailwind directives
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Pantallas

| Ruta                  | Descripción                            | Rol     |
| --------------------- | -------------------------------------- | ------- |
| `/`                   | Landing / Inicio                       | Público |
| `/login`              | Inicio de sesión y registro            | Público |
| `/catalogo`           | Catálogo de vehículos                  | Cliente |
| `/vehiculo/:id`       | Detalle del vehículo                   | Cliente |
| `/reserva`            | Reserva y pago                         | Cliente |
| `/confirmacion`       | Confirmación de reserva                | Cliente |
| `/mis-reservas`       | Panel del cliente                      | Cliente |
| `/operaciones`        | Panel del operador (devolución)        | Operador |
| `/admin`              | Dashboard del administrador            | Admin   |

## Conectar el backend

Cuando el backend esté listo, reemplaza el contenido de `src/data/vehicles.js` y `src/data/reservations.js` por llamadas reales a la API. Por ejemplo:

```js
// src/data/vehicles.js (antes)
export const VEHICLES = [ { id: 1, ... }, ... ];

// src/data/vehicles.js (después)
export async function getVehicles() {
  const res = await fetch('https://api.motogo.do/vehiculos');
  return res.json();
}
```

Luego en las páginas, usa un `useEffect` + `useState` para cargar los datos.

## Comandos disponibles

| Comando            | Descripción                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Arranca el servidor de desarrollo        |
| `npm run build`    | Genera la versión de producción          |
| `npm run preview`  | Previsualiza la versión de producción    |

## Equipo

- Robert Abreu (23-0121)
- Bradhelyn Poueriet (24-1272)
- Merilyn Pérez (25-0450)
- Hamashia Sosa (25-0705)

**Grupo 11 · Sección 02 · Proyecto Integrador II · 2026**
