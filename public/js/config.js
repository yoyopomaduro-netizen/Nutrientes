export const FB_CONFIG = { apiKey:"AIzaSyBTfFwgOefC1A_62tSZ9PgYYXY_odVjftQ", authDomain:"nutrilent-813f6.firebaseapp.com", projectId:"nutrilent-813f6", storageBucket:"nutrilent-813f6.firebasestorage.app", messagingSenderId:"438441655569", appId:"1:438441655569:web:ce99c1efd3b5af756160b0" };
export const WORKER_URL = "https://nutrientes.nutrilent.workers.dev/api/chat";
export const FREE_LIMIT = 5;
export const ADMIN_EMAIL = 'yoyopomaduro@gmail.com';

export const REGION_CONTEXT = {
  es:"América Latina y España. Considera platos típicos como arepas, tacos, paella, empanadas, etc.",
  en:"United States. Consider dishes like burgers, mac and cheese, barbecue.",
  pt:"Brasil e Portugal. Feijoada, churrasco, bacalhau.",
  fr:"France. Croissant, coq au vin, ratatouille.",
  de:"Alemanha. Schnitzel, bratwurst, sauerkraut.",
  it:"Itália. Pizza, pasta, risotto.",
  ja:"Japão. Sushi, ramen, tempura.",
  zh:"China. Dim sum, pato laqueado.",
  ar:"Países árabes. Hummus, falafel, kebab.",
  hi:"Índia. Curry, biryani, samosa.",
  ko:"Coreia. Kimchi, bulgogi, bibimbap.",
  ru:"Rússia. Borscht, blini, pelmeni."
};

export const GLOBAL_BRAIN = {
  LATAM_MEX_CENTRO: { nombre:"Norteamérica Hispana", paises:"México, Centroamérica, Caribe", base:"Maíz, chiles, frijoles, aguacate, cerdo", vibe:"Carbohidratos y grasas porcinas" },
  SUDAMERICA_ANDINA: { nombre:"Región Andina", paises:"Colombia, Perú, Ecuador, Bolivia", base:"Papa, arroz, maíz, pollo, cuy, frutas tropicales", vibe:"Carbohidratos de alto índice glucémico" },
  SUDAMERICA_SUR: { nombre:"Cono Sur", paises:"Argentina, Chile, Uruguay", base:"Carne vacuna, trigo, vino, lácteos", vibe:"Alta en proteína animal y grasas saturadas" },
  BRASIL: { nombre:"Brasil", paises:"Brasil", base:"Arroz, frijoles, mandioca, carne, frutas", vibe:"Balanceada con alto consumo de proteína animal" },
  ESPANA: { nombre:"España", paises:"España", base:"Trigo, aceite de oliva, pescado, cerdo, verduras", vibe:"Mediterránea, equilibrada" },
  ASIA: { nombre:"Asia Oriental", paises:"Japón, China, Corea", base:"Arroz, pescado, soya, vegetales", vibe:"Baja en grasas, alta en carbohidratos complejos" },
  MEDIO_ORIENTE: { nombre:"Medio Oriente", paises:"Países árabes, Turquía, Irán", base:"Trigo, garbanzos, cordero, lácteos, dátiles", vibe:"Moderada en proteínas, alta en carbohidratos" },
  INDIA: { nombre:"India", paises:"India, Pakistán, Bangladés", base:"Arroz, trigo, legumbres, lácteos, especias", vibe:"Alta en carbohidratos, moderada en proteínas vegetales" },
  AFRICA: { nombre:"África", paises:"Nigeria, Etiopía, Ghana, Kenia", base:"Maíz, arroz, yuca, plátano, legumbres", vibe:"Alta en carbohidratos complejos y fibra" },
  EUROPA: { nombre:"Europa Central", paises:"Alemania, Francia, Reino Unido, Italia", base:"Trigo, lácteos, carnes procesadas, vino", vibe:"Balanceada, alta en lácteos y carnes" }
};

export const REGLAS_RELIGIOSAS = {
  halal: { nombre:"Halal", desc:"Sin cerdo ni alcohol. Carne sacrificada según normas islámicas." },
  kosher: { nombre:"Kosher", desc:"Sin cerdo ni mariscos. No mezclar lácteos con carne." },
  hindu: { nombre:"Hindú", desc:"Sin carne de res (vaca sagrada). Muchos son vegetarianos." },
  budista: { nombre:"Budista", desc:"Generalmente vegetariano, evita el ajo y la cebolla." },
  adventista: { nombre:"Adventista", desc:"Vegetarianos, evitan cafeína, alcohol y estimulantes." },
  ortodoxo: { nombre:"Cristiano Ortodoxo", desc:"Ayunos que evitan carne, lácteos y huevos en ciertas temporadas." },
  mormon: { nombre:"Mormón (SUD)", desc:"Evitan alcohol, café, té y bebidas con cafeína." }
};

export const COLOMBIAN_PRODUCTS = {
  '7701001012340': { product_name:'Chocoramo', brands:'Ramo', nutriments:{'energy-kcal_100g':420,'proteins_100g':6.5,'carbohydrates_100g':58,'fat_100g':18,'fiber_100g':1.5,'sodium_100g':0.3}, serving_size:'60g' },
  '7701001012357': { product_name:'Gansito', brands:'Ramo', nutriments:{'energy-kcal_100g':440,'proteins_100g':5.8,'carbohydrates_100g':55,'fat_100g':22,'fiber_100g':1,'sodium_100g':0.25}, serving_size:'50g' },
  '7701001012364': { product_name:'Ponqué Ramo', brands:'Ramo', nutriments:{'energy-kcal_100g':380,'proteins_100g':6,'carbohydrates_100g':50,'fat_100g':17,'fiber_100g':1.2,'sodium_100g':0.35}, serving_size:'100g' },
  '7701001001016': { product_name:'Todito Clásico', brands:'Margarita', nutriments:{'energy-kcal_100g':520,'proteins_100g':6.5,'carbohydrates_100g':52,'fat_100g':32,'fiber_100g':3,'sodium_100g':0.6}, serving_size:'40g' },
  '7701001001023': { product_name:'Todito BBQ', brands:'Margarita', nutriments:{'energy-kcal_100g':510,'proteins_100g':6,'carbohydrates_100g':54,'fat_100g':30,'fiber_100g':2.5,'sodium_100g':0.7}, serving_size:'40g' },
  '7701001002013': { product_name:'Jet', brands:'Colombina', nutriments:{'energy-kcal_100g':540,'proteins_100g':5,'carbohydrates_100g':58,'fat_100g':33,'fiber_100g':1,'sodium_100g':0.15}, serving_size:'30g' },
  '7701001002020': { product_name:'Jet Maní', brands:'Colombina', nutriments:{'energy-kcal_100g':550,'proteins_100g':8,'carbohydrates_100g':50,'fat_100g':35,'fiber_100g':2,'sodium_100g':0.2}, serving_size:'30g' },
  '7701001003010': { product_name:'Súper Coco', brands:'Colombina', nutriments:{'energy-kcal_100g':480,'proteins_100g':4,'carbohydrates_100g':65,'fat_100g':23,'fiber_100g':2.5,'sodium_100g':0.1}, serving_size:'30g' },
  '7701001004017': { product_name:'Tostacos', brands:'Colombina', nutriments:{'energy-kcal_100g':500,'proteins_100g':7,'carbohydrates_100g':55,'fat_100g':28,'fiber_100g':2,'sodium_100g':0.8}, serving_size:'45g' },
  '7701002001014': { product_name:'Saltín Noel', brands:'Noel', nutriments:{'energy-kcal_100g':430,'proteins_100g':9,'carbohydrates_100g':65,'fat_100g':15,'fiber_100g':3,'sodium_100g':0.9}, serving_size:'30g' },
  '7701002001021': { product_name:'Galletas Festival', brands:'Noel', nutriments:{'energy-kcal_100g':460,'proteins_100g':7,'carbohydrates_100g':68,'fat_100g':18,'fiber_100g':2,'sodium_100g':0.5}, serving_size:'35g' },
  '7701002001038': { product_name:'Galletas Ducales', brands:'Noel', nutriments:{'energy-kcal_100g':450,'proteins_100g':6,'carbohydrates_100g':67,'fat_100g':17,'fiber_100g':1.5,'sodium_100g':0.4}, serving_size:'36g' },
  '7701002002011': { product_name:'Tosh Avena y Miel', brands:'Noel', nutriments:{'energy-kcal_100g':410,'proteins_100g':8,'carbohydrates_100g':72,'fat_100g':10,'fiber_100g':5,'sodium_100g':0.35}, serving_size:'30g' },
  '7701002002028': { product_name:'Tosh Integral', brands:'Noel', nutriments:{'energy-kcal_100g':390,'proteins_100g':9,'carbohydrates_100g':68,'fat_100g':9,'fiber_100g':7,'sodium_100g':0.3}, serving_size:'30g' },
  '7701003001018': { product_name:'Yogur Griego Natural', brands:'Alpina', nutriments:{'energy-kcal_100g':120,'proteins_100g':8,'carbohydrates_100g':6,'fat_100g':7,'fiber_100g':0,'sodium_100g':0.08}, serving_size:'150g' },
  '7701003001025': { product_name:'Yogur Griego Fresa', brands:'Alpina', nutriments:{'energy-kcal_100g':130,'proteins_100g':7,'carbohydrates_100g':14,'fat_100g':5,'fiber_100g':0,'sodium_100g':0.07}, serving_size:'150g' },
  '7701003001032': { product_name:'Bon Yurt Fresa', brands:'Alpina', nutriments:{'energy-kcal_100g':85,'proteins_100g':3.5,'carbohydrates_100g':14,'fat_100g':2,'fiber_100g':0,'sodium_100g':0.06}, serving_size:'150g' },
  '7701003002015': { product_name:'Arequipe Alpina', brands:'Alpina', nutriments:{'energy-kcal_100g':320,'proteins_100g':6,'carbohydrates_100g':58,'fat_100g':8,'fiber_100g':0,'sodium_100g':0.1}, serving_size:'30g' },
  '7701003003012': { product_name:'Fricolino Fresa', brands:'Alpina', nutriments:{'energy-kcal_100g':195,'proteins_100g':3,'carbohydrates_100g':30,'fat_100g':7,'fiber_100g':0.5,'sodium_100g':0.05}, serving_size:'95g' },
  '7701003004017': { product_name:'Kumis Alpina', brands:'Alpina', nutriments:{'energy-kcal_100g':65,'proteins_100g':3,'carbohydrates_100g':9,'fat_100g':2,'fiber_100g':0,'sodium_100g':0.07}, serving_size:'200g' },
  '7701004001019': { product_name:'Salchichas Zenú', brands:'Zenú', nutriments:{'energy-kcal_100g':220,'proteins_100g':12,'carbohydrates_100g':5,'fat_100g':18,'fiber_100g':0,'sodium_100g':1.2}, serving_size:'100g' },
  '7701004001026': { product_name:'Jamón Zenú', brands:'Zenú', nutriments:{'energy-kcal_100g':130,'proteins_100g':16,'carbohydrates_100g':2,'fat_100g':6,'fiber_100g':0,'sodium_100g':1.5}, serving_size:'100g' },
  '7701004001033': { product_name:'Chorizo Zenú', brands:'Zenú', nutriments:{'energy-kcal_100g':280,'proteins_100g':14,'carbohydrates_100g':3,'fat_100g':24,'fiber_100g':0,'sodium_100g':1.1}, serving_size:'100g' },
  '7701004002016': { product_name:'Manjar Zenú', brands:'Zenú', nutriments:{'energy-kcal_100g':250,'proteins_100g':8,'carbohydrates_100g':20,'fat_100g':15,'fiber_100g':0,'sodium_100g':0.8}, serving_size:'100g' },
  '7701005001019': { product_name:'Frunas', brands:'Colombina', nutriments:{'energy-kcal_100g':360,'proteins_100g':0.5,'carbohydrates_100g':88,'fat_100g':0.2,'fiber_100g':0,'sodium_100g':0.02}, serving_size:'12g' },
  '7701005001026': { product_name:'Bom Bom bum', brands:'Colombina', nutriments:{'energy-kcal_100g':400,'proteins_100g':3,'carbohydrates_100g':70,'fat_100g':13,'fiber_100g':1,'sodium_100g':0.1}, serving_size:'12g' },
  '7701005001033': { product_name:'Chupeta Ácida', brands:'Colombina', nutriments:{'energy-kcal_100g':380,'proteins_100g':0,'carbohydrates_100g':95,'fat_100g':0,'fiber_100g':0,'sodium_100g':0.05}, serving_size:'14g' },
  '7701005002012': { product_name:'Dulce de Leche Colombina', brands:'Colombina', nutriments:{'energy-kcal_100g':310,'proteins_100g':5,'carbohydrates_100g':68,'fat_100g':2,'fiber_100g':0,'sodium_100g':0.15}, serving_size:'25g' },
  '7701005003019': { product_name:'Panelitas Colombina', brands:'Colombina', nutriments:{'energy-kcal_100g':370,'proteins_100g':1,'carbohydrates_100g':90,'fat_100g':0.5,'fiber_100g':0,'sodium_100g':0.03}, serving_size:'25g' },
  '7701006001019': { product_name:'Gaseosa Colombiana', brands:'Postobón', nutriments:{'energy-kcal_100g':42,'proteins_100g':0,'carbohydrates_100g':11,'fat_100g':0,'fiber_100g':0,'sodium_100g':0.01}, serving_size:'350ml' },
  '7701006001026': { product_name:'Gaseosa Manzana Postobón', brands:'Postobón', nutriments:{'energy-kcal_100g':45,'proteins_100g':0,'carbohydrates_100g':12,'fat_100g':0,'fiber_100g':0,'sodium_100g':0.01}, serving_size:'350ml' },
  '7701006001033': { product_name:'Gaseosa Uva Postobón', brands:'Postobón', nutriments:{'energy-kcal_100g':44,'proteins_100g':0,'carbohydrates_100g':11.5,'fat_100g':0,'fiber_100g':0,'sodium_100g':0.01}, serving_size:'350ml' },
  '7701006002012': { product_name:'Pony Malta', brands:'Bavaria', nutriments:{'energy-kcal_100g':48,'proteins_100g':0.5,'carbohydrates_100g':11,'fat_100g':0,'fiber_100g':0,'sodium_100g':0.01}, serving_size:'330ml' },
  '7701007001019': { product_name:'Pan Bimbo Blanco', brands:'Bimbo', nutriments:{'energy-kcal_100g':260,'proteins_100g':8,'carbohydrates_100g':48,'fat_100g':3.5,'fiber_100g':2.5,'sodium_100g':0.5}, serving_size:'40g' },
  '7701007002019': { product_name:'Donas Bimbo', brands:'Bimbo', nutriments:{'energy-kcal_100g':380,'proteins_100g':6,'carbohydrates_100g':45,'fat_100g':20,'fiber_100g':1,'sodium_100g':0.4}, serving_size:'55g' },
  '7701008001019': { product_name:'Sorbete Crema', brands:'Colombina', nutriments:{'energy-kcal_100g':180,'proteins_100g':3,'carbohydrates_100g':25,'fat_100g':8,'fiber_100g':0,'sodium_100g':0.05}, serving_size:'100g' },
  '7701010001011': { product_name:'Pastas Doria Spaghetti', brands:'Doria', nutriments:{'energy-kcal_100g':350,'proteins_100g':12,'carbohydrates_100g':72,'fat_100g':1,'fiber_100g':3,'sodium_100g':0.01}, serving_size:'100g' },
  '7701011001019': { product_name:'Café Sello Rojo', brands:'Sello Rojo', nutriments:{'energy-kcal_100g':2,'proteins_100g':0,'carbohydrates_100g':0,'fat_100g':0,'fiber_100g':0,'sodium_100g':0}, serving_size:'1 taza' },
  '7701011003019': { product_name:'Leche Klim', brands:'Nestlé', nutriments:{'energy-kcal_100g':490,'proteins_100g':24,'carbohydrates_100g':38,'fat_100g':27,'fiber_100g':0,'sodium_100g':0.4}, serving_size:'30g' },
  '7701011004016': { product_name:'Crem Helado', brands:'Colombina', nutriments:{'energy-kcal_100g':200,'proteins_100g':3,'carbohydrates_100g':24,'fat_100g':11,'fiber_100g':0,'sodium_100g':0.06}, serving_size:'100g' }
};
