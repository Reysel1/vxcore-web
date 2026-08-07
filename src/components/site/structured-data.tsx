import { SITE_NAME, SITE_URL, SOCIAL_LINKS, URANTIX_STORE_URL } from "@/lib/site";

/**
 * Datos estructurados (JSON-LD) de la portada.
 *
 * Es lo que permite a Google entender qué es VXCore en vez de adivinarlo del
 * texto: producto de software, para qué sirve, cuánto cuesta y quién lo hace.
 * De aquí salen los resultados enriquecidos con precio y valoración.
 *
 * El precio tiene que coincidir con el de Stripe y con la página de precios: si
 * se desvían, Google marca el dato como incorrecto y retira el resultado
 * enriquecido.
 */
const PRICE_EUR = "27";

export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Urantix",
        url: URANTIX_STORE_URL,
        sameAs: SOCIAL_LINKS.map((social) => social.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "es-ES",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Panel de control de servidores de juego",
        operatingSystem: "Windows",
        url: SITE_URL,
        description:
          "Panel de control para servidores FiveM (FXServer): consola RCON, logs, base de datos, automatizaciones y un agente de IA conectado a tu servidor.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "Offer",
          price: PRICE_EUR,
          priceCurrency: "EUR",
          category: "subscription",
          url: SITE_URL,
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // El contenido es nuestro y no lleva datos de usuario. Se escapa `<` para
      // que una cadena no pueda cerrar la etiqueta script antes de tiempo.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
