# Spec 004 · Política de contraseñas · Requisitos

| Campo | Valor |
|---|---|
| Estado | **Aprobada** · 2026-10-21 |
| Fecha | 2026-10-21 |
| Origen | Política de la compañía, punto 3.1 «Lineamientos para la elaboración de contraseñas» |
| Repos | Backend y frontend (nuestros y del cliente) |

## Contexto

Hoy la contraseña exige mínimo 8 caracteres con mayúscula, minúscula y número (`Domain/Identity/PasswordPolicy.cs`; el front muestra las mismas reglas en `features/auth/domain/rules/password-rules.ts`). No hay historial ni vencimiento. La regla se aplica al activar la cuenta, recuperar la contraseña, cambiarla (incluida la temporal) y en las contraseñas temporales del seed y del administrador.

## Política (3.1)

1. Al menos **3 de 4** tipos de caracteres: mayúsculas, minúsculas, números y caracteres especiales.
2. Mínimo **12** caracteres.
3. No contener, total ni parcialmente, el **nombre del usuario**.
4. No ser una **palabra común**.
5. Vigencia de **90 días**.
6. No repetir las **últimas 5** contraseñas.

## Requisitos

### R1 · Regla de composición (backend)
- [ ] `PasswordPolicy` exige mínimo 12 caracteres y al menos 3 de los 4 tipos (especial = cualquier carácter que no sea letra ni número).
- [ ] Rechaza contraseñas que contengan el usuario o sus datos personales (D2) y las palabras comunes (D1).
- [ ] El error indica **qué regla** no se cumple.
- [ ] Se aplica en activación, recuperación, cambio de contraseña, contraseña temporal del administrador y seed.

### R2 · Historial de las últimas 5 (backend)
- [ ] Al cambiar la contraseña se guarda el hash anterior; no se acepta una nueva igual a la actual ni a las 4 anteriores.
- [ ] El historial guarda solo hashes y conserva únicamente los últimos 5 por usuario.

### R3 · Vigencia de 90 días (backend)
- [ ] Si la contraseña tiene más de 90 días (`PasswordSetAtUtc`), el login exige cambiarla antes de entrar, con el mismo flujo de la contraseña temporal.
- [ ] Al cambiarla se reinicia la vigencia.

### R4 · Frontend
- [ ] Las pantallas de crear, recuperar y cambiar contraseña muestran las reglas nuevas y su cumplimiento mientras se escribe (12 caracteres, 3 de 4 tipos, sin el usuario).
- [ ] Las reglas que solo puede validar el backend (palabra común, historial) se muestran como mensaje de error al enviar.
- [ ] La pantalla de cambio obligatorio indica si es por contraseña temporal o por vencimiento.

### R5 · Pruebas
- [ ] Pruebas unitarias de cada regla, del historial y del vencimiento (backend) y de las reglas del front.

## Decisiones

| ID | Pregunta | Propuesta | Decisión |
|---|---|---|---|
| D1 | ¿Qué es «palabra común»? | Lista incluida en el backend de contraseñas más usadas y palabras del negocio (`naviera`, `transoceanica`, `petral`, `proveedor`, `password`, `contraseña`, `qwerty`, `123456`…). Se compara sin mayúsculas, tildes, números ni símbolos al inicio o al final (`Naviera2026!` cuenta como común) | Aceptada (2026-10-21) |
| D2 | ¿Qué es contener el nombre «parcialmente»? | No puede contener el usuario (DNI/RUC/username), ni ningún nombre o apellido del usuario de 3 letras o más, sin distinguir mayúsculas ni tildes | Aceptada (2026-10-21) |
| D3 | ¿La vigencia de 90 días aplica a todos? | Sí: usuarios internos y proveedores | Aceptada: a todos (2026-10-21) |
| D4 | ¿Qué pasa con las contraseñas actuales que no cumplen la nueva regla? | Se mantienen hasta que venzan (90 días desde su último cambio); las cuentas con contraseña de más de 90 días deben cambiarla en el próximo ingreso | Aceptada (2026-10-21) |
| D5 | ¿Se avisa antes del vencimiento? | No en esta spec (queda como mejora) | Aceptada: fuera de esta spec (2026-10-21) |

## Fuera de alcance

- Aviso previo de vencimiento por correo o en pantalla (D5).
- Doble factor para usuarios internos (requerimiento aparte).
- Bloqueo por intentos fallidos (ya existe).
