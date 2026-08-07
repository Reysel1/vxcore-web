import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos trata VXCore, con qué finalidad, durante cuánto tiempo y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro="Qué datos personales tratamos, para qué, con quién los compartimos y qué puedes hacer al respecto."
    >
      <LegalSection title="Responsable del tratamiento">
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300">
          <strong>Pendiente de completar:</strong> denominación social, NIF,
          domicilio y email de contacto del responsable. El RGPD exige
          identificarlo, y no son datos que podamos rellenar por ti.
        </p>
      </LegalSection>

      <LegalSection title="Qué datos tratamos">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Cuenta:</strong> email, nombre y foto de perfil, que nos
            facilita Google o Discord cuando inicias sesión, más el proveedor
            utilizado. No recibimos tu contraseña en ningún caso.
          </li>
          <li>
            <strong>Facturación:</strong> identificadores de cliente, de pedido y
            de pago generados por Stripe, junto con el importe y el estado.{" "}
            <strong>No almacenamos datos de tarjeta.</strong>
          </li>
          <li>
            <strong>Licencia:</strong> la clave asociada a tu cuenta y su estado.
          </li>
          <li>
            <strong>Soporte:</strong> los mensajes que nos envías por el
            formulario de contacto, el chat o los tickets.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Para qué y con qué base legal">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Prestarte el servicio, activar tu licencia y gestionar la suscripción
            — <em>ejecución del contrato</em>.
          </li>
          <li>
            Atender tus consultas de soporte — <em>ejecución del contrato</em> o{" "}
            <em>interés legítimo</em> si aún no eres cliente.
          </li>
          <li>
            Cumplir obligaciones fiscales y contables —{" "}
            <em>obligación legal</em>.
          </li>
          <li>
            Mantener la seguridad del servicio y prevenir el uso fraudulento de
            licencias — <em>interés legítimo</em>.
          </li>
        </ul>
        <p>
          No hacemos perfilado ni decisiones automatizadas con efectos jurídicos,
          y no vendemos tus datos a nadie.
        </p>
      </LegalSection>

      <LegalSection title="Quién más los trata">
        <p>
          Solo los proveedores necesarios para que el servicio funcione, cada uno
          con su propio contrato de encargado de tratamiento:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Vercel</strong> — alojamiento de la web y del panel.
          </li>
          <li>
            <strong>Turso</strong> — base de datos donde viven las cuentas,
            pedidos, licencias y mensajes.
          </li>
          <li>
            <strong>Stripe</strong> — pasarela de pago y gestión de la
            suscripción.
          </li>
          <li>
            <strong>Google</strong> y <strong>Discord</strong> — únicamente para
            el inicio de sesión.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores pueden tratar datos fuera del Espacio
          Económico Europeo, amparándose en las cláusulas contractuales tipo de
          la Comisión Europea o en decisiones de adecuación.
        </p>
      </LegalSection>

      <LegalSection title="Cuánto tiempo los guardamos">
        <p>
          Los datos de tu cuenta y tu licencia, mientras la cuenta siga activa. La
          información de facturación, durante los plazos que exige la normativa
          fiscal. Los mensajes de soporte, mientras sean útiles para atenderte y
          acreditar lo hablado.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Puedes solicitar acceso, rectificación, supresión, limitación,
          portabilidad y oposición escribiéndonos desde la sección de contacto.
          Responderemos en el plazo de un mes.
        </p>
        <p>
          Si consideras que no hemos atendido bien tu solicitud, puedes reclamar
          ante la Agencia Española de Protección de Datos (
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            aepd.es
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="Menores">
        <p>
          El servicio no está dirigido a menores de 14 años. Si detectamos una
          cuenta de un menor sin autorización de sus tutores, la eliminaremos.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
