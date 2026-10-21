// Guarda de gestor de paquetes (Requirement 22.7).
//
// Rechaza cualquier instalacion que no se realice con pnpm, inspeccionando la
// variable de entorno `npm_config_user_agent` que exponen npm, yarn y pnpm al
// ejecutar los scripts del ciclo de vida (incluido `preinstall`).
//
// Sin dependencias de terceros, para mantener minima la superficie de seguridad
// (Requirement 23). No ejecuta operaciones de red ni accede a recursos sensibles.

const userAgent = process.env.npm_config_user_agent || '';
const gestor = userAgent.split(' ')[0].split('/')[0];

// Si no hay user agent (ejecucion directa con `node`), no bloqueamos: el guard
// solo debe actuar durante instalaciones de un gestor de paquetes.
if (userAgent !== '' && gestor !== 'pnpm') {
  console.error('\n\u001b[31mEste proyecto usa pnpm como unico gestor de paquetes.\u001b[0m');
  console.error(
    `Se detecto una instalacion con "${gestor || 'desconocido'}", que no esta permitida.`,
  );
  console.error('\nUsa pnpm en su lugar:');
  console.error('  pnpm install\n');
  console.error('Instala pnpm con: npm install -g pnpm@12.14.0  (o corepack enable)\n');
  process.exit(1);
}
