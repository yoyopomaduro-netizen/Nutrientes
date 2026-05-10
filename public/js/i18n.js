export let currentLang = (function(){ try{ return JSON.parse(localStorage.getItem('nl_lang') || 'null') || 'es'; }catch{ return 'es'; } })();

function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }
function lsGet(k, d){ try{ return JSON.parse(localStorage.getItem(k)||'null') ?? d; }catch{ return d; } }

export const TR = {
  es: {
    greet: "Fotografía · Analiza · Aprende", analyzeBtn: "Analizar comida", analyzing: "Analizando...", usageLabel: "Análisis este mes", noImage: "Sube una imagen primero 👆",
    toastSaved: "✅ Perfil guardado", toastUpgradeSim: "🚀 Modo Pro activado (demo)", syncCloud: "Sincronizando...", coachLocked: "Hazte Pro para acceder al coach nutricional IA 24/7.",
    toastHistoryCleared: "🗑️ Historial eliminado", toastProfileSaved: "✅ Perfil guardado", toastExportDone: "📄 Historial exportado", toastCopied: "📋 Copiado al portapapeles",
    toastNoResult: "No hay resultado para compartir", toastProActivated: "🎉 Modo Pro activado!", toastProDeactivated: "👤 Volviste a usuario básico",
    toastLoginError: "Error al iniciar sesión con Google", toastLogout: "👋 Sesión cerrada", toastImageError: "Error al cargar la imagen",
    toastAccountDeleted: "🗑️ Cuenta eliminada", toastAccountError: "Error al eliminar cuenta", toastNoSession: "No hay sesión activa",
    toastPlanUpdated: "✅ Plan semanal actualizado con tus cambios", toastCoachError: "Error de conexión. Intenta de nuevo.",
    toastCameraError: "❌ No se pudo acceder a la cámara", toastBarcodeInvalid: "❌ Código inválido. Debe tener 8-13 dígitos.",
    toastBarcodeAdded: "agregado al historial", toastBarcodeNameRequired: "✏️ Escribe el nombre del producto",
    toastMetaReached: "🎉 ¡Alcanzaste tu meta calórica del día!", toastAnalysisError: "Intenta con otra imagen.",
    confirmClearHistory: "¿Borrar todo el historial?", confirmDeleteAccount: "¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.",
    promptBarcodeManual: "No se pudo acceder a la cámara.\nIngresa el código de barras manualmente (8-13 dígitos):",
    planIncludes: "Incluye", planUnlockMsg: "Desbloquea todas las funciones premium", planViewPlans: "⚡ Ver Planes Pro", planEnjoyingMsg: "✨ Disfrutando de todas las funciones premium", planChangePlan: "💳 Cambiar Plan", planClose: "Cerrar",
    coachPlaceholder: "Pregunta a tu coach...", planLocked: "Genera tu plan de comidas personalizado.", btnGenPlan: "✨ Generar Plan Semanal", exportPDF: "📄 Exportar", clearHistory: "Limpiar",
    saveProfile: "Calcular y guardar metas", login: "Iniciar sesión con Google", logout: "salir", proBadge: "⚡ Pro", metaCal: "Calorías hoy", metaProt: "Proteínas hoy",
    histSection: "Historial", planSection: "Plan Semanal", menuHistory: "Historial", menuPlan: "Plan Semanal", menuSuscripcion: "Mi Plan", menuProfile: "Perfil", menuSettings: "Configuración", menuHelp: "Ayuda", menuTerms: "Términos y Políticas",
    tabScan: "Analizar", tabHist: "Historial", tabPlan: "Plan", tabProfile: "Perfil", tabSettings: "Ajustes", uploadStrong: "Toca para subir", uploadText: "una foto de tu comida",
    cameraToggle: "Usar cámara en tiempo real", ingLabel: "Ingredientes detectados", shareBtn: "📤 Compartir resultado", aiSummaryBtn: "Pedir recomendación de IA para hoy", aiLabel: "✦ Recomendación IA",
    coachTitle: "🤖 Coach Nutricional IA", coachWelcome: "¡Hola! Soy tu coach nutricional IA. Pregúntame lo que quieras sobre alimentación, nutrición o tus metas. 💪",
    coachActionPlan: "🔄 Cambiar desayuno", coachActionProtein: "💪 Más proteína", coachActionCalories: "🔥 Menos calorías", coachActionLike: "👍 Me gusta",
    coachActionRegister: "📝 Registrar", coachActionAlternatives: "🔍 Alternativas", coachActionCanEat: "🤔 ¿Puedo?",
    coachActionMoreInfo: "📖 Más info", coachActionApply: "📋 Aplicar", coachActionOtherTip: "🎯 Otro tip",
    coachActionMotivation: "💪 Motivación", coachActionMeal: "🥗 Comida", coachActionProgress: "📊 Progreso",
    btnUnlockCoach: "Desbloquear Coach ⚡", btnUnlockPlan: "Desbloquear Plan Pro ⚡", microLabel: "Micronutrientes", metasCompareTitle: "Aporte a tus metas del día",
    cmpCal: "Calorías", cmpProt: "Proteínas", macroProt: "Proteína", macroCarb: "Carbos", macroFat: "Grasas", chartTitle: "Calorías — últimos 7 días", settingsTitle: "Ajustes",
    settingsSub: "Configuración de la aplicación", settingsAppearance: "Apariencia", settingsTheme: "Tema oscuro", settingsThemeSub: "Alterna entre modo claro/oscuro", settingsLang: "Idioma",
    settingsLangLabel: "Idioma de la interfaz", settingsLangSub: "Cambia el idioma de la aplicación", settingsData: "Datos", settingsNotif: "Notificaciones", settingsNotifSub: "Recordatorios para registrar comidas",
    settingsAbout: "Acerca de", settingsProLabel: "Modo Pro (demo)", settingsProSub: "Activa/desactiva funciones Pro para pruebas", profilePersonal: "Datos personales", profileGoalSect: "Objetivo y actividad",
    labelNombre: "Nombre", labelPeso: "Peso (kg)", labelAltura: "Altura (cm)", labelEdad: "Edad", labelSexo: "Sexo", labelObjetivo: "Objetivo", labelActividad: "Nivel de actividad",
    metasCalcTitle: "✦ Metas calculadas automáticamente", labelMetaCal: "🔥 Meta calórica diaria", labelMetaProt: "💪 Proteínas", labelMetaCarbs: "🌾 Carbohidratos", labelMetaFats: "🫒 Grasas",
    labelTMB: "🧬 TMB (basal)", macroDistTitle: "📊 Distribución de macros", mealDistTitle: "🍽️ Comidas sugeridas", recoTitle: "💡 Recomendaciones", macroProtLabel: "Proteínas",
    macroCarbsLabel: "Carbohidratos", macroFatsLabel: "Grasas", footerTerms: "Términos de Servicio", footerPrivacy: "Política de Privacidad", footerContact: "Contacto", helpClose: "Cerrar",
    headerEyebrow: "AI vision · análisis nutricional", welcomeTitle: "¡Bienvenido a NutriLent!", welcomeMsg: "Comienza subiendo una foto de tu comida para analizarla con IA.",
    copyright: "© 2025 NutriLent AI · Todos los derechos reservados", trademark: "NutriLent® marca registrada", disclaimer: "Los análisis son orientativos y no reemplazan el criterio de un profesional de la salud.",
    noFileSelected: "Ningún archivo seleccionado", scanPreparing: "preparando análisis...", step1Text: "Detectando ingredientes y porciones", step2Text: "Calculando macronutrientes",
    step3Text: "Analizando índice glucémico", step4Text: "Generando consejo personalizado", nombrePlaceholder: "Tu nombre", pesoPlaceholder: "70", alturaPlaceholder: "170", edadPlaceholder: "25",
    sexoMasc: "Masculino", sexoFem: "Femenino", objetivoBajar: "🎯 Bajar de peso", objetivoMusculo: "💪 Ganar músculo", objetivoMantener: "⚖️ Mantenerme",
    actividad1_1: "🪑 Muy sedentario (<3000 pasos/día)", actividad1_2: "🚶 Sedentario (3000-5000 pasos)", actividad1_375: "🏃 Ligero (1-2 días/semana)",
    actividad1_5: "💪 Moderado (3-4 días/semana)", actividad1_7: "⚡ Activo (5-6 días/semana)", actividad1_9: "🔥 Muy activo (diario + trabajo físico)",
    motivaciones: ["Cada comida es una decisión 💚","Tu cuerpo es tu templo 🔋","Pequeños pasos, grandes cambios 🚀","La nutrición es información 🧬","Hoy es un buen día para cuidarte ✨","Consistencia > Perfección 📈","Come bien, vive mejor 🌿"],
    giLow: "IG bajo", giMedium: "IG medio", giHigh: "IG alto"
  },
  en: {
    greet: "Photograph · Analyze · Learn", analyzeBtn: "Analyze food", analyzing: "Analyzing...", usageLabel: "Monthly analyses", noImage: "Upload an image first 👆",
    toastSaved: "✅ Profile saved", toastUpgradeSim: "🚀 Pro mode activated (demo)", syncCloud: "Syncing...", coachLocked: "Upgrade to Pro to access the 24/7 AI nutrition coach.",
    toastHistoryCleared: "🗑️ History cleared", toastProfileSaved: "✅ Profile saved", toastExportDone: "📄 History exported", toastCopied: "📋 Copied to clipboard",
    toastNoResult: "No result to share", toastProActivated: "🎉 Pro mode activated!", toastProDeactivated: "👤 Back to basic user",
    toastLoginError: "Error signing in with Google", toastLogout: "👋 Signed out", toastImageError: "Error loading image",
    toastAccountDeleted: "🗑️ Account deleted", toastAccountError: "Error deleting account", toastNoSession: "No active session",
    toastPlanUpdated: "✅ Weekly plan updated with your changes", toastCoachError: "Connection error. Try again.",
    toastCameraError: "❌ Could not access camera", toastBarcodeInvalid: "❌ Invalid code. Must be 8-13 digits.",
    toastBarcodeAdded: "added to history", toastBarcodeNameRequired: "✏️ Enter the product name",
    toastMetaReached: "🎉 You reached your daily calorie goal!", toastAnalysisError: "Try with another image.",
    confirmClearHistory: "Clear all history?", confirmDeleteAccount: "Are you sure you want to delete your account? This cannot be undone.",
    promptBarcodeManual: "Could not access the camera.\nEnter the barcode manually (8-13 digits):",
    planIncludes: "Includes", planUnlockMsg: "Unlock all premium features", planViewPlans: "⚡ View Pro Plans", planEnjoyingMsg: "✨ Enjoying all premium features", planChangePlan: "💳 Change Plan", planClose: "Close",
    coachPlaceholder: "Ask your coach...", planLocked: "Generate your personalized meal plan.", btnGenPlan: "✨ Generate Weekly Plan", exportPDF: "📄 Export", clearHistory: "Clear",
    saveProfile: "Calculate & save goals", login: "Sign in with Google", logout: "sign out", proBadge: "⚡ Pro", metaCal: "Today's calories", metaProt: "Today's protein",
    histSection: "History", planSection: "Weekly Plan", menuHistory: "History", menuPlan: "Weekly Plan", menuSuscripcion: "My Plan", menuProfile: "Profile", menuSettings: "Settings", menuHelp: "Help", menuTerms: "Terms & Policies",
    tabScan: "Analyze", tabHist: "History", tabPlan: "Plan", tabProfile: "Profile", tabSettings: "Settings", uploadStrong: "Tap to upload", uploadText: "a photo of your meal",
    cameraToggle: "Use real-time camera", ingLabel: "Detected ingredients", shareBtn: "📤 Share result", aiSummaryBtn: "Ask AI for today's recommendation", aiLabel: "✦ AI Recommendation",
    coachTitle: "🤖 AI Nutrition Coach", coachWelcome: "Hi! I'm your AI nutrition coach. Ask me anything about food, nutrition, or your goals. 💪",
    coachActionPlan: "🔄 Change breakfast", coachActionProtein: "💪 More protein", coachActionCalories: "🔥 Less calories", coachActionLike: "👍 I like it",
    coachActionRegister: "📝 Register", coachActionAlternatives: "🔍 Alternatives", coachActionCanEat: "🤔 Can I?",
    coachActionMoreInfo: "📖 More info", coachActionApply: "📋 Apply", coachActionOtherTip: "🎯 Another tip",
    coachActionMotivation: "💪 Motivation", coachActionMeal: "🥗 Meal", coachActionProgress: "📊 Progress",
    btnUnlockCoach: "Unlock Coach ⚡", btnUnlockPlan: "Unlock Pro Plan ⚡", microLabel: "Micronutrients", metasCompareTitle: "Contribution to today's goals",
    cmpCal: "Calories", cmpProt: "Protein", macroProt: "Protein", macroCarb: "Carbs", macroFat: "Fats", chartTitle: "Calories — last 7 days", settingsTitle: "Settings",
    settingsSub: "App configuration", settingsAppearance: "Appearance", settingsTheme: "Dark theme", settingsThemeSub: "Toggle light/dark mode", settingsLang: "Language",
    settingsLangLabel: "Interface language", settingsLangSub: "Change the app language", settingsData: "Data", settingsNotif: "Notifications", settingsNotifSub: "Meal reminders",
    settingsAbout: "About", settingsProLabel: "Pro mode (demo)", settingsProSub: "Enable/disable Pro features for testing", profilePersonal: "Personal data", profileGoalSect: "Goal & activity",
    labelNombre: "Name", labelPeso: "Weight (kg)", labelAltura: "Height (cm)", labelEdad: "Age", labelSexo: "Sex", labelObjetivo: "Goal", labelActividad: "Activity level",
    metasCalcTitle: "✦ Automatically calculated goals", labelMetaCal: "🔥 Daily calorie goal", labelMetaProt: "💪 Protein", labelMetaCarbs: "🌾 Carbs", labelMetaFats: "🫒 Fats",
    labelTMB: "🧬 BMR (basal)", macroDistTitle: "📊 Macro distribution", mealDistTitle: "🍽️ Suggested meal distribution", recoTitle: "💡 Recommendations", macroProtLabel: "Protein",
    macroCarbsLabel: "Carbs", macroFatsLabel: "Fats", footerTerms: "Terms of Service", footerPrivacy: "Privacy Policy", footerContact: "Contact", helpClose: "Close",
    headerEyebrow: "AI vision · nutritional analysis", welcomeTitle: "Welcome to NutriLent!", welcomeMsg: "Start by uploading a photo of your meal to analyze it with AI.",
    copyright: "© 2025 NutriLent AI · All rights reserved", trademark: "NutriLent® registered trademark", disclaimer: "Analyses are for guidance only and do not replace professional medical advice.",
    noFileSelected: "No file selected", scanPreparing: "preparing analysis...", step1Text: "Detecting ingredients and portions", step2Text: "Calculating macronutrients",
    step3Text: "Analyzing glycemic index", step4Text: "Generating personalized advice", nombrePlaceholder: "Your name", pesoPlaceholder: "70", alturaPlaceholder: "170", edadPlaceholder: "25",
    sexoMasc: "Male", sexoFem: "Female", objetivoBajar: "🎯 Lose weight", objetivoMusculo: "💪 Gain muscle", objetivoMantener: "⚖️ Maintain weight",
    actividad1_1: "🪑 Very sedentary (<3000 steps/day)", actividad1_2: "🚶 Sedentary (3000-5000 steps)", actividad1_375: "🏃 Light (1-2 days/week)",
    actividad1_5: "💪 Moderate (3-4 days/week)", actividad1_7: "⚡ Active (5-6 days/week)", actividad1_9: "🔥 Very active (daily + physical work)",
    motivaciones: ["Every meal is a choice 💚","Your body is your temple 🔋","Small steps, big changes 🚀","Nutrition is information 🧬","Today is a good day to take care of yourself ✨","Consistency > Perfection 📈","Eat well, live better 🌿"],
    giLow: "Low GI", giMedium: "Medium GI", giHigh: "High GI"
  },
  pt: {
    greet: "Fotografe · Analise · Aprenda", analyzeBtn: "Analisar comida", analyzing: "Analisando...", usageLabel: "Análises este mês", noImage: "Envie uma imagem primeiro 👆",
    toastSaved: "✅ Perfil salvo", toastUpgradeSim: "🚀 Modo Pro ativado (demo)", syncCloud: "Sincronizando...", coachLocked: "Torne-se Pro para acessar o coach nutricional IA 24/7.",
    toastHistoryCleared: "🗑️ Histórico limpo", toastProfileSaved: "✅ Perfil salvo", toastExportDone: "📄 Histórico exportado", toastCopied: "📋 Copiado para área de transferência",
    toastNoResult: "Nenhum resultado para compartilhar", toastProActivated: "🎉 Modo Pro ativado!", toastProDeactivated: "👤 Voltou a usuário básico",
    toastLoginError: "Erro ao entrar com Google", toastLogout: "👋 Sessão encerrada", toastImageError: "Erro ao carregar imagem",
    toastAccountDeleted: "🗑️ Conta excluída", toastAccountError: "Erro ao excluir conta", toastNoSession: "Nenhuma sessão ativa",
    toastPlanUpdated: "✅ Plano semanal atualizado com suas alterações", toastCoachError: "Erro de conexão. Tente novamente.",
    toastCameraError: "❌ Não foi possível acessar a câmera", toastBarcodeInvalid: "❌ Código inválido. Deve ter 8-13 dígitos.",
    toastBarcodeAdded: "adicionado ao histórico", toastBarcodeNameRequired: "✏️ Digite o nome do produto",
    toastMetaReached: "🎉 Você atingiu sua meta calórica diária!", toastAnalysisError: "Tente com outra imagem.",
    confirmClearHistory: "Limpar todo o histórico?", confirmDeleteAccount: "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.",
    promptBarcodeManual: "Não foi possível acessar a câmera.\nDigite o código de barras manualmente (8-13 dígitos):",
    planIncludes: "Inclui", planUnlockMsg: "Desbloqueie todos os recursos premium", planViewPlans: "⚡ Ver Planos Pro", planEnjoyingMsg: "✨ Aproveitando todos os recursos premium", planChangePlan: "💳 Mudar Plano", planClose: "Fechar",
    coachPlaceholder: "Pergunte ao seu coach...", planLocked: "Gere seu plano de refeições personalizado.", btnGenPlan: "✨ Gerar Plano Semanal", exportPDF: "📄 Exportar", clearHistory: "Limpar",
    saveProfile: "Calcular e salvar metas", login: "Entrar com Google", logout: "sair", proBadge: "⚡ Pro", metaCal: "Calorias hoje", metaProt: "Proteínas hoje",
    histSection: "Histórico", planSection: "Plano Semanal", menuHistory: "Histórico", menuPlan: "Plano Semanal", menuSuscripcion: "Meu Plano", menuProfile: "Perfil", menuSettings: "Configurações", menuHelp: "Ajuda", menuTerms: "Termos e Políticas",
    tabScan: "Analisar", tabHist: "Histórico", tabPlan: "Plano", tabProfile: "Perfil", tabSettings: "Ajustes", uploadStrong: "Toque para enviar", uploadText: "uma foto da sua refeição",
    cameraToggle: "Usar câmera em tempo real", ingLabel: "Ingredientes detectados", shareBtn: "📤 Compartilhar resultado", aiSummaryBtn: "Pedir recomendação de IA para hoje", aiLabel: "✦ Recomendação IA",
    coachTitle: "🤖 Coach Nutricional IA", coachWelcome: "Olá! Sou seu coach nutricional IA. Pergunte-me qualquer coisa sobre alimentação, nutrição ou suas metas. 💪",
    coachActionPlan: "🔄 Mudar café da manhã", coachActionProtein: "💪 Mais proteína", coachActionCalories: "🔥 Menos calorias", coachActionLike: "👍 Gostei",
    coachActionRegister: "📝 Registrar", coachActionAlternatives: "🔍 Alternativas", coachActionCanEat: "🤔 Posso?",
    coachActionMoreInfo: "📖 Mais info", coachActionApply: "📋 Aplicar", coachActionOtherTip: "🎯 Outra dica",
    coachActionMotivation: "💪 Motivação", coachActionMeal: "🥗 Refeição", coachActionProgress: "📊 Progresso",
    btnUnlockCoach: "Desbloquear Coach ⚡", btnUnlockPlan: "Desbloquear Plano Pro ⚡", microLabel: "Micronutrientes", metasCompareTitle: "Contribuição para as metas de hoje",
    cmpCal: "Calorias", cmpProt: "Proteínas", macroProt: "Proteína", macroCarb: "Carboidratos", macroFat: "Gorduras", chartTitle: "Calorias — últimos 7 dias", settingsTitle: "Ajustes",
    settingsSub: "Configuração do aplicativo", settingsAppearance: "Aparência", settingsTheme: "Tema escuro", settingsThemeSub: "Alternar modo claro/escuro", settingsLang: "Idioma",
    settingsLangLabel: "Idioma da interface", settingsLangSub: "Alterar o idioma do aplicativo", settingsData: "Dados", settingsNotif: "Notificações", settingsNotifSub: "Lembretes de refeições",
    settingsAbout: "Sobre", settingsProLabel: "Modo Pro (demo)", settingsProSub: "Ativar/desativar recursos Pro para testes", profilePersonal: "Dados pessoais", profileGoalSect: "Objetivo e atividade",
    labelNombre: "Nome", labelPeso: "Peso (kg)", labelAltura: "Altura (cm)", labelEdad: "Idade", labelSexo: "Sexo", labelObjetivo: "Objetivo", labelActividad: "Nível de atividade",
    metasCalcTitle: "✦ Metas calculadas automaticamente", labelMetaCal: "🔥 Meta calórica diária", labelMetaProt: "💪 Proteínas", labelMetaCarbs: "🌾 Carboidratos", labelMetaFats: "🫒 Gorduras",
    labelTMB: "🧬 TMB (basal)", macroDistTitle: "📊 Distribuição de macros", mealDistTitle: "🍽️ Distribuição de refeições sugerida", recoTitle: "💡 Recomendações", macroProtLabel: "Proteínas",
    macroCarbsLabel: "Carboidratos", macroFatsLabel: "Gorduras", footerTerms: "Termos de Serviço", footerPrivacy: "Política de Privacidade", footerContact: "Contato", helpClose: "Fechar",
    headerEyebrow: "AI visão · análise nutricional", welcomeTitle: "Bem-vindo ao NutriLent!", welcomeMsg: "Comece enviando uma foto da sua refeição para analisá-la com IA.",
    copyright: "© 2025 NutriLent AI · Todos os direitos reservados", trademark: "NutriLent® marca registrada", disclaimer: "As análises são orientativas e não substituem o conselho de um profissional de saúde.",
    noFileSelected: "Nenhum arquivo selecionado", scanPreparing: "preparando análise...", step1Text: "Detectando ingredientes e porções", step2Text: "Calculando macronutrientes",
    step3Text: "Analisando índice glicêmico", step4Text: "Gerando conselho personalizado", nombrePlaceholder: "Seu nome", pesoPlaceholder: "70", alturaPlaceholder: "170", edadPlaceholder: "25",
    sexoMasc: "Masculino", sexoFem: "Feminino", objetivoBajar: "🎯 Perder peso", objetivoMusculo: "💪 Ganhar músculo", objetivoMantener: "⚖️ Manter peso",
    actividad1_1: "🪑 Muito sedentário (<3000 passos/dia)", actividad1_2: "🚶 Sedentário (3000-5000 passos)", actividad1_375: "🏃 Leve (1-2 dias/semana)",
    actividad1_5: "💪 Moderado (3-4 dias/semana)", actividad1_7: "⚡ Ativo (5-6 dias/semana)", actividad1_9: "🔥 Muito ativo (diário + trabalho físico)",
    motivaciones: ["Cada refeição é uma decisão 💚","Seu corpo é seu templo 🔋","Pequenos passos, grandes mudanças 🚀","Nutrição é informação 🧬","Hoje é um bom dia para se cuidar ✨","Consistência > Perfeição 📈","Coma bem, viva melhor 🌿"],
    giLow: "IG baixo", giMedium: "IG médio", giHigh: "IG alto"
  }
};

export function t(key) {
  return (TR[currentLang] || TR.es)[key] ?? TR.es[key] ?? key;
}

export function setLang(lang) {
  currentLang = lang;
  lsSet('nl_lang', lang);
}

export function applyLanguage() {
  var label = document.getElementById('langLabel');
  if (label) label.textContent = currentLang.toUpperCase();
  document.querySelectorAll('.lang-option').forEach(function(o) {
    o.classList.toggle('active', o.getAttribute('data-lang') === currentLang);
  });
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key);
  });
}
