---
name: i18n-nutrilent
description: Sistema de traducciones ES/EN/PT para NutriLent AI. Gestiona cambio de idioma en toda la app incluyendo coach IA. Usa objeto TR[] y localStorage.
---

## 🌐 Idiomas Soportados
- **ES** (Español) - default
- **EN** (English)
- **PT** (Português)

## 📋 Implementación
1. **Objeto TR[]**: Contiene todas las claves de texto en los 3 idiomas.
2. **Función t(key)**: Devuelve la traducción según `currentLang` (guardado en localStorage).
3. **Función applyLanguage()**: Recorre el DOM y actualiza textos con `data-i18n`.
4. **Coach IA**: Incluir el idioma activo en el system prompt para que responda en el idioma correcto.
5. **Persistencia**: Guardar preferencia en `localStorage.setItem('nl_lang', lang)`.
6. **Selector de idioma**: Debe llamar a `applyLanguage()` al cambiar.

## ⚠️ Reglas
- NO duplicar claves en TR[].
- Usar `setText(id, t('clave'))` para textos dinámicos.
- Los placeholders también deben traducirse.
- Verificar que todas las claves existan en los 3 idiomas.
