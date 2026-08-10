import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'vehiculos-fotos';

// Solo se usa para Storage: la sesión del usuario la maneja el backend con su propio JWT.
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

export const isStorageConfigured = Boolean(supabase);

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Storage rechaza rutas con espacios y acentos: los colapsamos a guiones.
function safeName(name) {
  return name.replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase();
}

/**
 * Sube una foto al bucket y devuelve su URL pública (la que espera el campo
 * `fotos` de la API). Lanza un Error con mensaje legible si algo falla.
 */
export async function uploadVehiclePhoto(file, vehicleId) {
  if (!supabase) {
    throw new Error('Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato no admitido. Usa JPG, PNG o WEBP.');
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`La imagen supera ${MAX_SIZE_MB} MB.`);
  }

  const path = `${vehicleId}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Borra una foto del bucket a partir de su URL pública. */
export async function removeVehiclePhoto(publicUrl) {
  if (!supabase) return;

  const marker = `/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(publicUrl.slice(index + marker.length));
  await supabase.storage.from(BUCKET).remove([path]);
}
