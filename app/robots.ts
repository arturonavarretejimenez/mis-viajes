import type { MetadataRoute } from "next";

// Álbum privado: pedimos explícitamente que no se indexe en buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
