export async function validateAdmin(_u, p) {
  return p === import.meta.env.VITE_ADMIN_PASSWORD;
}
