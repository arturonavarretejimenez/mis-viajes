# Ideas pendientes

Cosas habladas pero no implementadas. Cada una lleva el contexto necesario para
retomarla sin tener que reconstruir la conversación.

---

## 1. Contraseña por álbum

**Qué se quiere:** además (o en vez) de la contraseña única del sitio, poder
proteger álbumes concretos con su propia contraseña. Caso de uso: enseñar los
álbumes de un viaje a los amigos de ese viaje y no a todo el mundo que tenga la
contraseña general.

### Estado actual (de dónde se parte)

- Contraseña única del sitio en la variable de entorno `SITE_PASSWORD`.
- `proxy.ts` intercepta todas las rutas y redirige a `/login` si la cookie
  `viajes_sesion` no coincide con el hash de esa contraseña.
- `lib/auth.ts` genera el token (SHA-256 de la contraseña) y compara en tiempo
  constante.
- La base de datos tiene **RLS abierta**: el rol `anon` puede leer y escribir
  todo en `albums` y `media`.

### El obstáculo real

**Con la RLS actual esto no se puede hacer bien.** Si se guarda el hash de la
contraseña de un álbum en la tabla `albums`, cualquiera con la clave pública
(que va en el navegador, es visible en el código de la página) puede leerlo con
una llamada directa a la API de Supabase. Y peor: puede leer las filas de
`media` del álbum protegido y sacar las URLs de las fotos, saltándose la
contraseña por completo.

Es decir: **la contraseña por álbum obliga a cerrar antes la base de datos.**
No es un extra opcional, es un requisito previo. Sin eso, la funcionalidad
daría una falsa sensación de seguridad, que es peor que no tenerla.

### Trabajo que implica

**Fase 1 — cerrar la base de datos** (esto es el "nivel sólido" que se ofreció
en su día y se descartó por rapidez):

1. Cambiar las políticas RLS: quitar los permisos de `anon` en `albums` y
   `media`, y en el bucket `media` de Storage.
2. Añadir `SUPABASE_SERVICE_ROLE_KEY` como variable de entorno en Vercel
   (secreta, **sin** `NEXT_PUBLIC_`, marcada como Sensitive).
3. Crear un cliente de Supabase de servidor que use esa clave
   (`lib/supabase/admin.ts`), y que **nunca** se importe desde un componente
   cliente.
4. Reescribir la subida de fotos y vídeos: hoy `components/upload-button.tsx`
   sube directo desde el navegador al bucket. Habría que pasarlo por una Route
   Handler que reciba el archivo y suba con la clave de servicio. Ojo con el
   límite de tamaño de cuerpo de petición en Vercel — para 50 MB probablemente
   haga falta una URL de subida firmada (`createSignedUploadUrl`) en vez de
   pasar el archivo por el servidor.
5. Servir las imágenes con URLs firmadas y caducidad, en vez de con el bucket
   público.

**Fase 2 — la contraseña por álbum en sí:**

1. Tabla aparte `album_secrets` (`album_id`, `password_hash`, `created_at`) con
   RLS que niegue todo a `anon`. Tabla aparte y no una columna en `albums` para
   que no pueda colarse en un `select *` por descuido.
2. Hash con algo lento y con sal (bcrypt o argon2), **no** SHA-256 pelado como
   el del sitio: aquí sí hay un hash almacenado que alguien podría llegar a
   robar, y las contraseñas de álbum serán cortas y adivinables.
3. Cookie por álbum: `album_<id>_auth`, httpOnly, con el mismo esquema de
   comparación en tiempo constante.
4. `proxy.ts` tiene que distinguir rutas: `/album/<slug>` mira si ese álbum
   tiene secreto y exige su cookie. Cuidado: el proxy corre en Edge y no puede
   hacer consultas pesadas — probablemente convenga cachear qué álbumes están
   protegidos, o mover la comprobación al propio Server Component de la página.
5. UI: botón de "Proteger este álbum" en la página del álbum, pantalla de
   contraseña específica, y forma de quitar la protección.

### Decisiones que hay que tomar antes de empezar

- **¿Convive con la contraseña del sitio o la sustituye?** Encadenar dos
  contraseñas para entrar a un álbum es molesto. Lo más probable: la del sitio
  pasa a ser opcional, y los álbumes protegidos piden la suya.
- **¿Qué pasa con la portada y el contador en la home?** Un álbum protegido,
  ¿aparece en la lista con la portada visible, aparece difuminado, o no aparece?
- **¿Se puede recuperar una contraseña de álbum olvidada?** Sin sistema de
  cuentas no hay "he olvidado mi contraseña". Lo razonable es poder cambiarla
  desde dentro (habiendo entrado ya) y que la del sitio sirva de llave maestra.

### Estimación honesta

La fase 1 es la gorda: toca almacenamiento, subida y permisos, y hay riesgo de
romper la subida de archivos grandes. La fase 2 encima es más llevadera. No es
un rato, es una sesión entera de trabajo con pruebas.
