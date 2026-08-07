import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "VXCore solo usa cookies estrictamente necesarias para iniciar sesión. Sin analítica ni publicidad.",
  alternates: { canonical: "/cookies" },
};

const COOKIES = [
  {
    name: "__Host-authjs.csrf-token",
    purpose:
      "Protege el formulario de inicio de sesión frente a peticiones falsificadas desde otros sitios (CSRF).",
    duration: "De sesión",
  },
  {
    name: "__Secure-authjs.callback-url",
    purpose:
      "Recuerda a qué página volver cuando terminas de iniciar sesión con Google o Discord.",
    duration: "De sesión",
  },
  {
    name: "__Secure-authjs.session-token",
    purpose:
      "Mantiene tu sesión iniciada para que el panel sepa quién eres. Solo se crea al iniciar sesión.",
    duration: "30 días",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      intro="Resumen corto: VXCore solo usa las cookies imprescindibles para que puedas iniciar sesión. No hay analítica, ni publicidad, ni rastreo de terceros."
    >
      <LegalSection title="Qué es una cookie">
        <p>
          Un archivo pequeño que un sitio guarda en tu navegador para recordar
          algo entre una página y la siguiente. Algunas son imprescindibles para
          que el sitio funcione; otras sirven para medir audiencias o mostrar
          publicidad. <strong>Aquí solo usamos las del primer tipo.</strong>
        </p>
      </LegalSection>

      <LegalSection title="Cookies que utilizamos">
        <p>
          Todas son <strong>estrictamente necesarias</strong> y las instala
          Auth.js, la biblioteca que gestiona el inicio de sesión. Se marcan como{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            HttpOnly
          </code>{" "}
          y{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            Secure
          </code>
          , de modo que ningún script puede leerlas y solo viajan por HTTPS.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-semibold">Cookie</th>
                <th className="py-2 pr-4 font-semibold">Para qué sirve</th>
                <th className="py-2 font-semibold">Duración</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((cookie) => (
                <tr key={cookie.name} className="border-b border-border/50">
                  <td className="py-3 pr-4 align-top font-mono text-xs">
                    {cookie.name}
                  </td>
                  <td className="py-3 pr-4 align-top text-muted-foreground">
                    {cookie.purpose}
                  </td>
                  <td className="py-3 align-top text-muted-foreground">
                    {cookie.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Por qué no te pedimos consentimiento">
        <p>
          La normativa de cookies exige pedir consentimiento para las que{" "}
          <em>no</em> son imprescindibles: analítica, publicidad, redes sociales
          incrustadas. Como no usamos ninguna de esas, no hay nada que
          consentir, y por eso no verás un banner. Si algún día añadimos
          analítica, aparecerá el aviso correspondiente y podrás rechazarla.
        </p>
      </LegalSection>

      <LegalSection title="Otros datos guardados en tu navegador">
        <p>
          Tu preferencia de tema (claro u oscuro) se guarda en el{" "}
          <strong>almacenamiento local</strong> de tu navegador, no en una
          cookie. No sale de tu equipo y no nos llega.
        </p>
      </LegalSection>

      <LegalSection title="Cómo eliminarlas">
        <p>
          Puedes borrar o bloquear las cookies desde los ajustes de tu navegador.
          Ten en cuenta que, al ser imprescindibles para la sesión, bloquearlas
          impedirá iniciar sesión y acceder a tu panel.
        </p>
      </LegalSection>

      <LegalSection title="Servicios externos">
        <p>
          Cuando realizas un pago, el proceso ocurre en el dominio de{" "}
          <strong>Stripe</strong>, que aplica su propia política de cookies. Lo
          mismo sucede al iniciar sesión en las pantallas de{" "}
          <strong>Google</strong> o <strong>Discord</strong>. Nosotros no
          instalamos cookies en tu navegador en nombre de esos servicios.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
