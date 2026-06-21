// Datos hardcodeados. Cuando el backend esté listo, reemplazar por:
//   export async function getVehicles() {
//     const res = await fetch('/api/vehiculos');
//     return res.json();
//   }

export const VEHICLES = [
  { id: 1, name: 'Honda Navi 110', location: 'Piantini, Santo Domingo', rating: 4.8, trips: 142, type: 'Motor', price: 850, status: 'Disponible', theme: 'emerald' },
  { id: 2, name: 'Yamaha NMAX 155', location: 'Naco, Santo Domingo', rating: 4.9, trips: 98, type: 'Deportivo', price: 1650, status: 'Disponible', theme: 'violet' },
  { id: 3, name: 'Trek FX 2 Disc', location: 'Zona Colonial, SD', rating: 4.7, trips: 67, type: 'Bicicleta', price: 420, status: 'Disponible', theme: 'teal' },
  { id: 4, name: 'Honda PCX 160', location: 'Bella Vista, SD', rating: 5, trips: 211, type: 'Deportivo', price: 1900, status: 'En alquiler', theme: 'violet' },
  { id: 5, name: 'Yamaha BWS 125', location: 'Los Prados, SD', rating: 4.6, trips: 88, type: 'Motor', price: 980, status: 'Disponible', theme: 'emerald' },
  { id: 6, name: 'Rad Power E-Bike', location: 'Punta Cana', rating: 4.9, trips: 53, type: 'Bicicleta', price: 760, status: 'Disponible', theme: 'teal' },
  { id: 7, name: 'Kawasaki KLR 650', location: 'Santiago', rating: 4.8, trips: 121, type: 'Deportivo', price: 2400, status: 'En mantenimiento', theme: 'violet' },
  { id: 8, name: 'Honda Cargo 150', location: 'Villa Mella, SD', rating: 4.5, trips: 176, type: 'Motor', price: 1100, status: 'Disponible', theme: 'emerald' },
  { id: 9, name: 'Vespa Primavera', location: 'Gazcue, SD', rating: 4.9, trips: 44, type: 'Deportivo', price: 2100, status: 'Disponible', theme: 'violet' },
  { id: 10, name: 'Kia Picanto 2024', location: 'Bávaro, Punta Cana', rating: 4.8, trips: 73, type: 'Carro', price: 2800, status: 'Disponible', theme: 'sky' },
  { id: 11, name: 'Toyota Hilux 4x4', location: 'Santiago', rating: 4.9, trips: 51, type: 'Carro', price: 4500, status: 'En alquiler', theme: 'sky' },
];

export function getVehicleById(id) {
  return VEHICLES.find(v => v.id === Number(id));
}
