# Spec 009 · Renovación de sesión y correos que fallan · Requisitos

| Campo  | Valor                                                                                                                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estado | **En curso** · aprobada el 2026-11-03 (sesión: opción B, renovación automática)                                                                                                                                            |
| Fecha  | 2026-11-03                                                                                                                                                                                                                 |
| Origen | Observaciones del cliente en QAS: un usuario se creó sin que llegara el correo y la pantalla dijo «No pudimos guardar el usuario»; tras un rato el portal muestra errores genéricos o vuelve al login sin explicar por qué |
| Repos  | Backend y frontend (nuestros, rama `feature/sesion-y-correos` con PR; luego los del cliente)                                                                                                                               |

## Contexto

- El token dura 30 minutos desde el ingreso (`Jwt:AccessTokenMinutes`) y no se renueva. Al vencer, la siguiente acción responde 401: el front cierra la sesión y vuelve al login sin aviso, o la pantalla muestra su error genérico.
- Al crear un usuario se guarda primero y después se envía el correo; si el envío falla, la API responde 500 aunque el usuario quedó creado.

## Requisitos

### R1 · Renovación automática (opción B)

- [x] Mientras haya actividad (clics o teclas) la sesión se renueva sola antes de vencer, sin que la persona lo note.
- [x] Sin actividad durante 30 minutos la sesión se cierra y el login dice «Cerramos tu sesión por inactividad».
- [x] Tope de **12 horas** desde el ingreso: después hay que volver a ingresar.
- [x] No se renueva una cuenta desactivada o bloqueada.

### R2 · Aviso de sesión vencida

- [x] Ante un 401 el portal vuelve al login con «Tu sesión venció. Ingresa nuevamente para continuar.» y, al ingresar, regresa a la pantalla donde estaba.

### R3 · Alta de usuario aunque falle el correo

- [x] Si el correo de activación (o de verificación) no se puede enviar, el usuario queda creado y la API responde bien, indicando que el correo no salió.
- [x] La pantalla dice «Creamos a X, pero no pudimos enviar el correo de activación. Reenvíalo desde la pestaña Seguridad.».
- [x] Igual al editar: si falla el correo de verificación o de cambio de usuario, los cambios se guardan y se avisa.

## Fuera de alcance

- Cambiar el tiempo del token (sigue en 30 minutos; la renovación lo extiende).
