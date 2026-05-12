---
name: deploy-nutrilent
description: Despliega NutriLent AI a Firebase Hosting con verificacion previa de errores. Usa firebase deploy --only hosting desde ~/Descargas/nutrilent/Nutrientes.
---

## Procedimiento de Deploy

1. Verificar que public/index.html no tenga errores de sintaxis:
   - Revisar que no haya variables duplicadas
   - Revisar que todas las funciones llamadas en onclick existan
   - Revisar que todos los IDs referenciados existan
2. Ejecutar desde ~/Descargas/nutrilent/Nutrientes:
   firebase deploy --only hosting
3. Confirmar URL de produccion: https://nutrilent-813f6.web.app
4. Recordar al usuario limpiar cache del navegador (Ctrl+Shift+R) despues del deploy.
5. Si el deploy falla, verificar que firebase.json apunte a public/ como carpeta de hosting.
