import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/**
 * Imagen que se ve al compartir el enlace en X, Discord, WhatsApp o LinkedIn.
 *
 * Se genera en vez de usar una captura del panel porque las redes recortan a
 * 1200x630 y las capturas reales tienen otra proporción: acababan cortadas por
 * la mitad. Aquí el encuadre es exacto.
 */
export const alt = "VXCore — el sistema operativo de tu servidor FXServer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * El logo va embebido en base64: ImageResponse no resuelve rutas relativas
 * como `/brand/light.png`, y salir a buscarlo por HTTP durante el build sería
 * pedirle al sitio una imagen que todavía no está publicada.
 */
async function logoDataUri(): Promise<string> {
  const file = await readFile(
    path.join(process.cwd(), "public", "brand", "light.png")
  );
  return `data:image/png;base64,${file.toString("base64")}`;
}

export default async function OpengraphImage() {
  const logo = await logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Halo superior, para que no sea un rectángulo negro plano */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: 260,
            width: 680,
            height: 520,
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.10)",
            filter: "blur(120px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* El PNG ya trae la teja redondeada blanca, así que no lleva caja
              detrás: su fondo negro se funde con el de la tarjeta.
              next/image no sirve aquí: esto no es DOM de navegador, lo compone
              Satori para generar un PNG, y solo entiende <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={76} height={76} alt="" />
          <div style={{ display: "flex", fontSize: 42, fontWeight: 600, color: "#fafafa" }}>
            VXCore
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#fafafa",
            maxWidth: 900,
          }}
        >
          El sistema operativo de tu servidor FiveM
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.4,
            color: "rgba(250,250,250,0.62)",
            maxWidth: 860,
          }}
        >
          Consola, logs, base de datos y automatizaciones en un solo panel, con
          un agente de IA conectado a tu servidor.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 24,
            color: "rgba(250,250,250,0.45)",
          }}
        >
          vxcore.reylab.cloud
        </div>
      </div>
    ),
    size
  );
}
