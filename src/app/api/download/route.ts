import { NextResponse } from "next/server";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { auth } from "@/auth";
import {
  getDataDir,
  getLatestInstaller,
  hasDownloadAccess,
  isRemote,
} from "@/lib/db";
import { GithubError, getAssetDownloadUrl } from "@/lib/github";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!session?.user || !email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!hasDownloadAccess(email)) {
    return NextResponse.json(
      {
        error:
          "Tu suscripción no incluye la descarga. Completa el pago o contacta con el staff.",
      },
      { status: 403 }
    );
  }

  const installer = getLatestInstaller();
  if (!installer) {
    return NextResponse.json(
      { error: "Todavía no hay instalador publicado." },
      { status: 404 }
    );
  }

  // Instaladores alojados en releases de GitHub: pedimos una URL firmada y
  // temporal, y redirigimos. Los cientos de MB del .exe no pasan por aquí, que
  // es justo lo que hace viable servirlo desde una función serverless.
  if (installer.asset_id) {
    try {
      const url = await getAssetDownloadUrl(Number(installer.asset_id));
      if (!url) {
        return NextResponse.json(
          {
            error:
              "El instalador ya no está disponible en GitHub. Avisa al staff.",
          },
          { status: 404 }
        );
      }
      return NextResponse.redirect(url, 302);
    } catch (err) {
      if (err instanceof GithubError) {
        console.error("[VXCore] Error al resolver el instalador:", err.message);
        return NextResponse.json(
          { error: "No se pudo preparar la descarga. Avisa al staff." },
          { status: 502 }
        );
      }
      throw err;
    }
  }

  // Versiones antiguas guardadas en disco: solo existen en modo local.
  if (isRemote()) {
    return NextResponse.json(
      {
        error:
          "Esta versión se publicó en el servidor local y no está disponible aquí. Vuelve a publicarla desde el panel de administración.",
      },
      { status: 404 }
    );
  }

  const filePath = path.join(
    getDataDir(),
    "installers",
    String(installer.filename)
  );

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "El fichero del instalador no existe en el servidor." },
      { status: 404 }
    );
  }

  const fileStat = await stat(filePath);
  const downloadName = `VXCore-${String(installer.version)}${path.extname(
    String(installer.filename)
  )}`;

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Content-Length": String(fileStat.size),
      "Cache-Control": "no-store",
    },
  });
}
