---
name: pdf-nutrilent
description: Genera PDF nutricional del historial con diseno moderno de tarjetas. Usa jsPDF vanilla (sin autoTable). Implementa mitigaciones: fallback a TXT, word wrap, auto page break.
---

## Diseno del PDF (A4 vertical)

### Estructura
1. Encabezado: "NUTRILENT" centrado, fecha, nombre del usuario.
2. Macros promedio: 4 chips (kcal, proteina, carbos, grasas) con colores suaves.
3. Lista de platos: Tarjetas individuales con:
   - Fecha y tipo de comida
   - Nombre del plato en bold 14px
   - Macros en 10px gris
   - Fondo gris claro, borde redondeado simulado
4. Recomendacion IA: Tarjeta con borde izquierdo verde.
5. Footer: "NutriLent AI - Cada comida es una decision de salud"

### Mitigaciones
- jsPDF no cargado: verificar y hacer fallback a TXT
- Platos largos: usar splitTextToSize para word wrap
- Muchos platos: auto page break si posY > 250
- CDN jsPDF: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
- NO usar autoTable (causa problemas de compatibilidad)

### Especificaciones jsPDF
- Usar doc.text(), doc.rect(), doc.line()
- Margenes: 20mm
- Colores: texto oscuro, tarjetas gris claro, acento verde
