import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso de VXCore: suscripción, licencia de uso, cancelación y reembolsos.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      intro="Estas condiciones regulan el uso de VXCore, el panel de control para servidores FiveM (FXServer), y de la web vxcore.reylab.cloud."
    >
      <LegalSection title="1. Quiénes somos">
        <p>
          VXCore es un producto de Urantix. Para cualquier cuestión relacionada
          con estas condiciones puedes escribirnos desde la sección de contacto
          de la web o desde el chat de tu panel.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300">
          <strong>Pendiente de completar:</strong> aquí deben figurar la
          denominación social, el NIF y el domicilio del titular, además de un
          email de contacto. Son datos obligatorios según la LSSI-CE y no los
          hemos inventado.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué se contrata">
        <p>
          El instalador de VXCore se descarga sin coste. Lo que se contrata es
          una <strong>licencia de uso</strong> que activa el producto: sin una
          clave de licencia activa, la aplicación no funciona.
        </p>
        <p>
          La licencia es personal e intransferible y se vincula a la cuenta con
          la que se contrató. No autoriza a revender, redistribuir ni sublicenciar
          el producto, ni a compartir la clave con terceros.
        </p>
      </LegalSection>

      <LegalSection title="3. Precio, pago y renovación">
        <p>
          El plan se factura como <strong>suscripción mensual</strong> al precio
          indicado en la página de precios en el momento de la contratación,
          impuestos incluidos cuando así se señale. El cobro se gestiona
          íntegramente a través de <strong>Stripe</strong>; nosotros no
          almacenamos ni vemos los datos de tu tarjeta.
        </p>
        <p>
          La suscripción se renueva automáticamente cada periodo hasta que la
          canceles. Si un cobro de renovación falla, Stripe reintenta el cargo; si
          finalmente no se completa, la suscripción se da por terminada y la
          licencia deja de estar activa.
        </p>
      </LegalSection>

      <LegalSection title="4. Cancelación">
        <p>
          Puedes cancelar cuando quieras. La cancelación surte efecto{" "}
          <strong>al final del periodo ya pagado</strong>: conservas el acceso
          hasta esa fecha y no se emiten cobros posteriores. Al terminar el
          periodo, la licencia pasa a estado revocado y la aplicación deja de
          funcionar.
        </p>
      </LegalSection>

      <LegalSection title="5. Derecho de desistimiento">
        <p>
          Si contratas como consumidor en la Unión Europea dispones de 14 días
          naturales para desistir. Al tratarse de contenido digital de ejecución
          inmediata, al contratar aceptas que la prestación comience de inmediato
          y reconoces que <strong>pierdes el derecho de desistimiento</strong>{" "}
          una vez el servicio ha sido plenamente ejecutado, conforme al artículo
          103.m) del texto refundido de la Ley General para la Defensa de los
          Consumidores y Usuarios.
        </p>
      </LegalSection>

      <LegalSection title="6. Uso aceptable">
        <p>No está permitido utilizar VXCore para:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            eludir, desactivar o manipular el sistema de licencias, ni distribuir
            herramientas destinadas a ello;
          </li>
          <li>
            realizar ingeniería inversa sobre el producto salvo en la medida en
            que la ley lo permita expresamente;
          </li>
          <li>
            acceder a servidores, bases de datos o sistemas de terceros sin
            autorización de su titular;
          </li>
          <li>cualquier actividad ilícita o que vulnere derechos de terceros.</li>
        </ul>
        <p>
          El incumplimiento de este apartado puede conllevar la revocación de la
          licencia sin derecho a reembolso.
        </p>
      </LegalSection>

      <LegalSection title="7. Tu servidor es tuyo">
        <p>
          VXCore es una herramienta de administración: se ejecuta en tu equipo y
          actúa sobre tu servidor con las órdenes que tú le das. Eres responsable
          de la configuración de tu servidor, de los datos que contiene y de las
          copias de seguridad. Te recomendamos mantener copias propias antes de
          aplicar cambios relevantes.
        </p>
        <p>
          VXCore no está afiliado a Cfx.re, a FiveM ni a Rockstar Games. Las
          marcas citadas pertenecen a sus respectivos titulares.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilidad y garantías">
        <p>
          Trabajamos para que el servicio esté disponible de forma continuada,
          pero no garantizamos un funcionamiento ininterrumpido ni libre de
          errores. Podemos realizar tareas de mantenimiento y publicar
          actualizaciones que modifiquen o retiren funciones.
        </p>
        <p>
          Nada en estas condiciones excluye la responsabilidad que legalmente no
          pueda excluirse, en particular frente a consumidores.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios en estas condiciones">
        <p>
          Podemos actualizar estas condiciones. Si el cambio es sustancial te lo
          comunicaremos con antelación razonable por email o desde el propio
          panel. La fecha de la última revisión aparece al principio de esta
          página.
        </p>
      </LegalSection>

      <LegalSection title="10. Ley aplicable">
        <p>
          Estas condiciones se rigen por la legislación española. Si contratas
          como consumidor, conservas los derechos que te reconoce la normativa de
          tu país de residencia y puedes acudir a la plataforma europea de
          resolución de litigios en línea.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
