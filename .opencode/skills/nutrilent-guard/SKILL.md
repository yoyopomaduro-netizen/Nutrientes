---
name: nutrilent-guard
description: Reglas de seguridad y estándares de NutriLent AI. Activar SIEMPRE antes de modificar index.html, estilos o lógica. Previene JSON crudo, rotura de funciones globales, cambios en IDs existentes y violaciones de paleta de colores.
---

## 🛡️ REGLAS SAGRADAS (NO VIOLAR)

1. **NUNCA** muestres JSON crudo al usuario. Parsear todo a HTML visual con tarjetas, emojis y formato legible. Sin comillas, llaves ni corchetes visibles.
2. **NO** modifiques IDs existentes (uploadZone, uploadIcon, uploadLabelEl, fileInput, preview, cameraToggle, resultCard, coachSection, etc.).
3. **NO** borres ni renombres funciones globales (window.analyze, window.exportPDF, window.generateWeeklyPlan, window.toggleCamera, etc.).
4. **NO** crees archivos JS separados. Todo el código va inline en index.html dentro de <script type="module">.
5. **USA** solo CSS para cambios visuales; no reestructures el HTML existente a menos que sea estrictamente necesario y no rompa funcionalidad.
6. **MANTÉN** compatibilidad con data-i18n para traducciones. Los textos dinámicos deben usar el objeto TR[].
7. **VERIFICA** la consola del navegador después de cada cambio. Cero errores rojos.
8. **USA** la paleta oscura premium:
   - Fondos: #080808, #111111, #161616, #1e1e1e
   - Acentos: #b8f050 (verde neón), #50f0b8 (cyan)
   - Texto: #f0f0f0, #888 (muted), rgba(255,255,255,0.55) (dim)
   - Error: #ff5f5f
   - Bordes: rgba(255,255,255,0.06), rgba(255,255,255,0.1)
9. **USA** las fuentes: Syne (display), DM Sans (body).
10. **USA** las variables CSS existentes (--bg, --surface, --accent, etc.). No inventes nuevos colores.

## 📁 Estructura del proyecto
- Archivo principal: `public/index.html` (~1556 líneas)
- Firebase Config dentro de index.html con importmap
- Firebase Hosting config: `firebase.json` (carpeta public/)
- Proyecto Firebase: `nutrilent-813f6`
- URL producción: `https://nutrilent-813f6.web.app`

## 👑 Admin
- Email: yoyopomaduro@gmail.com
- Tiene acceso total a TODAS las funciones sin restricciones
- Plan Pro Anual guardado en Firestore (no localStorage)
