# Spec 002 · Archivos en Blob Storage · Tareas

Diseño: adaptador `AzureBlobFileStorage` del puerto `IFileStorage` (`Infrastructure/Files`), elegido en `AddInfrastructure` según `StorageSettings` (`Storage:Provider`). Paquete `Azure.Storage.Blobs`. Sin cambios en Application, Api ni frontend.

- [x] **T1** · `StorageSettings` + `AzureBlobFileStorage` + registro según el proveedor + log de arranque. *(R1, R2)* — `a37d0c7` (backend)
- [x] **T2** · Azurite en `docker-compose.yml`, `dev-up.sh` y `.env.example`. *(R3)* — `a37d0c7` (backend)
- [x] **T3** · Comando `migrate-storage` (copia `App_Data/documents` → contenedor). *(R4)* — `a37d0c7` (backend)
- [x] **T4** · Prueba de integración con Testcontainers.Azurite. *(R5)* — `a37d0c7` (backend)
- [x] **T5** · Documentación (README, AGENT_CONTEXT) y prueba en el navegador: registrar, descargar y observar con adjuntos. — `a37d0c7` (backend)
