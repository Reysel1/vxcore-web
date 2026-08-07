# VXCore Web

Web pública de VXCore: landing, login con Google/Discord, panel de usuario
(`/dashboard`), pago con Stripe, descarga del instalador y chat con el staff.

El proyecto **no depende de ninguna ruta local**: toda la configuración va por
variables de entorno (ver `.env.example`).

---

## Arquitectura de datos

VXCore comparte **una sola base de datos** entre la web y el panel admin.

| Modo | Dónde viven los datos | Para qué sirve |
| --- | --- | --- |
| **Local** (por defecto) | Fichero SQLite `data/vxcore.db` (o `VXCORE_DATA_DIR`) | Desarrollo en tu máquina |
| **Nube / Turso** (`TURSO_DATABASE_URL`) | SQLite en la nube (turso.tech) | Producción en Vercel |

> En **Vercel el disco es efímero y de solo lectura**: si no defines
> `TURSO_DATABASE_URL`, la app degrada a una base en memoria y el panel muestra
> un aviso (nada se guarda). Configura Turso y la web funciona para todo el
> mundo, sin ficheros ni rutas de ninguna máquina concreta.

Los **instaladores** (`/dashboard` → Descargar) son ficheros `.exe` que viven en
la máquina local donde se gestionan: se publican desde el panel admin local y
se sirven desde `data/installers/`. En Vercel esa descarga devuelve un mensaje
claro — para servir instaladores desde la nube haría falta almacenamiento de
objetos (S3/R2), aún no implementado.

---

## Arrancar en local

```bash
npm install
cp .env.example .env    # rellena los valores (o deja los de OAuth vacíos)
npm run dev
# Abre http://localhost:3000
```

La base de datos se crea sola en `data/vxcore.db`. Para que el **panel admin**
(proyecto `VXCore Admin`) comparta esos datos, apunta su `VXCORE_DATA_DIR` a
esta misma carpeta `data`:

```
VXCORE_DATA_DIR=C:\ruta\a\VXCore Web\data
```

## Desplegar en Vercel (para que funcione para todos)

1. Sube el repo a GitHub y conéctalo en [vercel.com/new](https://vercel.com/new)
   (framework: **Next.js**, se detecta solo).
2. Crea una base gratis en [turso.tech](https://turso.tech):
   ```bash
   npm i -g turso
   turso auth login
   turso db create vxcore
   turso db show vxcore --url        # → TURSO_DATABASE_URL
   turso db tokens create vxcore     # → TURSO_AUTH_TOKEN
   ```
3. En Vercel (Settings → Environment Variables) añade **todas** las del
   `.env.example`, con los valores de producción:
   `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_DISCORD_ID/SECRET`,
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_APP_URL=https://tu-dominio.com`, `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`.
4. Configura en los proveedores OAuth la URL de callback de tu dominio
   (`https://tu-dominio.com/api/auth/callback/google` y `/discord`).
5. Configura el webhook de Stripe hacia `https://tu-dominio.com/api/webhooks/stripe`.
6. Deploy. La web queda funcional para cualquiera, sin depender de ninguna
   máquina local.

> ⚠️ El **panel admin** (VXCore Admin) debe usar la **misma base Turso**
> (mismas `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`) para que web y admin vean
> los mismos usuarios, pedidos y licencias.

## Variables de entorno

Todas están documentadas en `.env.example` con instrucciones. Las más
importantes:

| Variable | Qué es |
| --- | --- |
| `AUTH_SECRET` | Firma las sesiones (genera: `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID/SECRET`, `AUTH_DISCORD_ID/SECRET` | Login con OAuth |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` | Pagos |
| `NEXT_PUBLIC_APP_URL` | URL pública (enlaces de vuelta de Stripe) |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Base de datos en la nube (producción) |
| `VXCORE_DATA_DIR` | **Solo local**: carpeta compartida con el panel admin |

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Desarrollo en http://localhost:3000 |
| `npm run build` | Compila el proyecto |
| `npm run start` | Sirve el build en producción |
| `npm run lint` | ESLint |
