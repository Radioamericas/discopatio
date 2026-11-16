# Buzón alternativo con control por dispositivo

## Idea
En vez de hacer otra web en Base44 (no podría leer los datos de esta), se crea una **segunda página dentro de esta misma web**, con su propio enlace (por ejemplo `discopatio.lovable.app/alt`). Comparte las canciones, los códigos y el panel. Así no hay que copiar ni sincronizar nada.

## Qué hará
1. **Reconocer el dispositivo.** Al entrar, el móvil u ordenador recibe una huella anónima (un código guardado en el navegador más una huella de su conexión). No se guarda el nombre ni la IP real.
2. **Contar canciones por semana.** Cada envío queda unido a esa huella. La semana empieza el jueves a las 14:00, como ahora.
3. **Límite por persona.** Por ejemplo, 2 canciones por dispositivo y semana (lo eliges tú en el panel). Al llegar al límite sale: «Ya has enviado 2 canciones esta semana. Vuelve el jueves».
4. **Funciona cuando la web principal está cerrada.** Con la web bloqueada o el buzón lleno, la pantalla «Próximamente» enseña un botón «Buzón alternativo». También puedes dejarla siempre como paso previo.
5. **Panel del equipo.** Nueva lista «Dispositivos»: cuántas canciones ha enviado cada uno esta semana, y botón para bloquear un dispositivo que abuse.

## Límites honestos
- Si alguien borra los datos del navegador o usa otro móvil, cuenta como dispositivo nuevo. La huella de conexión ayuda, pero en el wifi del instituto muchos comparten la misma.
- El aviso legal de conducta y la política de privacidad se actualizarán para mencionar la huella.

## Detalles técnicos
- Nueva columna `device_id` (UUID aleatorio en cookie httpOnly firmada, 1 año) y `ip_week_hash` (hash de IP con sal semanal, no diaria como ahora) en la tabla de actividad de envíos.
- `site_control.per_device_limit` (entero, por defecto 2) y tabla `blocked_devices`.
- Nueva ruta `src/routes/alt.tsx` reutilizando el formulario de HomePage; el server fn de envío comprueba el recuento semanal por `device_id` (y como respaldo por `ip_week_hash` con umbral más alto).
- La ruta `/alt` se añade a las rutas que siguen abiertas con la web bloqueada; control de apertura propio en el panel.
- Tests: límite semanal por dispositivo y reinicio el jueves.
