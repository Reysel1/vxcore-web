import { NextResponse } from "next/server";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { auth } from "@/auth";
import { getDataDir, getLatestInstaller, hasDownloadAccess } from "@/lib/db";

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
