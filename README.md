# <En Propuesta> — Plataforma de Evaluación con IA

Plataforma web que genera preguntas de opción múltiple automáticamente usando la **API de Google Gemini**. Los estudiantes se registran, responden evaluaciones y su puntaje se actualiza con cada resultado en una base de datos **MariaDB**.

---

## 🧠 ¿Cómo funciona?

El sistema seleciona temas → Gemini genera las preguntas → el estudiante responde → el sistema actualiza su puntaje único si es mayor a la anterior.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend / API REST | Node.js + Express.js |
| Base de datos | MariaDB |
| Generación de preguntas | Google Gemini API |
| Diseño de pantallas | Stitch |
| Frontend | React + Tailwind CSS |

---

## 🖼️ Pantallas (Stitch)

Las propuestas fueron diseñados con Stitch y se encuentran en `/propuesta/screens/`.

### Pantalla 1 — Login / Registro `(/)`
- Dos pestañas: **Iniciar sesión** y **Crear cuenta**
- Login: correo + contraseña → redirige al Dashboard
- Registro: nombre, correo, contraseña, confirmar contraseña
- Al autenticarse el servidor devuelve un JWT guardado en `localStorage`

### Pantalla 2 — Dashboard del estudiante `(/dashboard)`
- Encabezado con nombre del estudiante y puntaje actual resaltado
- Selector desplegable de tema (Matemáticas, Historia, Ciencias, etc.)
- Botón **"Iniciar evaluación"** → redirige al Quiz
- Tarjeta con el resultado de la última evaluación y mensaje motivacional
- Botón **"Cerrar sesión"**

### Pantalla 3 — Evaluación `(/quiz)`
- Barra de progreso (ej. 3 / 10 preguntas)
- Texto de la pregunta en tamaño prominente
- 4 opciones tipo botón; al seleccionar una se resalta
- Botón **"Siguiente"** deshabilitado hasta seleccionar respuesta
- Al terminar: pantalla de resultados con puntaje y botón **"Volver al inicio"**

---

## 🗄️ Modelo de base de datos — MariaDB

La base de datos se llama `<en propuesta>` y contiene 2 tablas.

### `usuarios`
Almacena a cada estudiante. `score` es el único campo que cambia con cada evaluación (no se guarda historial).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT UNSIGNED PK | Identificador único autoincremental |
| `name` | VARCHAR(100) | Nombre completo del estudiante |
| `email` | VARCHAR(150) UNIQUE | Correo electrónico (sirve de usuario) |
| `password` | VARCHAR(255) | Hash bcrypt de la contraseña |
| `score` | DECIMAL(5,2) | Puntaje 0-100 de la última evaluación |
| `created_at` | TIMESTAMP | Fecha de registro |
| `updated_at` | TIMESTAMP | Fecha de última modificación |

### `Temas`
Catálogo de áreas temáticas disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT UNSIGNED PK | Identificador único autoincremental |
| `name` | VARCHAR(100) UNIQUE | Nombre del tema (ej. Matemáticas) |
| `created_at` | TIMESTAMP | Fecha de creación |


### Relaciones

```
Temas ──< preguntas ──< respuestas
usuarios (independiente — solo almacena el score aparte de sus datos)
```

---

## 📡 Rutas de la API REST

### Autenticación — pública, no requieren JWT

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo estudiante → devuelve JWT |
| POST | `/api/auth/login` | Iniciar sesión → devuelve JWT |

### Usuarios — CRUD + puntaje `🔒 requieren JWT`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:id` | Obtener un usuario por ID |
| PUT | `/api/users/:id` | Actualizar nombre o correo |
| DELETE | `/api/users/:id` | Eliminar un usuario |
| PUT | `/api/users/:id/score` | Actualizar el puntaje tras una evaluación |

Body para actualizar puntaje:
```json
{ "score": 80 }
```

### Temas 

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/topics` | Listar todos los temas disponibles |
| POST | `/api/topics` | Crear un nuevo tema |
| DELETE | `/api/topics/:id` | Eliminar un tema |

---

## 📁 Estructura del repositorio
 
```
quiz-app/
├── README.md
├── schema.sql                        ← Script de creación de BD (MariaDB)
├── .env.example                      ← Plantilla de variables de entorno
├── package.json
├── next.config.js
├── propuesta/
│   ├── README.md                     ← Pantallas y modelo de BD explicados
│   └── screens/                      ← Imágenes exportadas de Stitch
├── app/
│   ├── layout.jsx                    ← Layout raíz
│   ├── page.jsx                      ← Login / Registro (/)
│   ├── dashboard/
│   │   └── page.jsx                  ← Panel del estudiante (/dashboard)
│   ├── quiz/
│   │   └── page.jsx                  ← Pantalla de evaluación (/quiz)
│   └── api/
│       ├── auth/
│       │   ├── register/route.js     ← POST /api/auth/register
│       │   └── login/route.js        ← POST /api/auth/login
│       ├── users/
│       │   ├── route.js              ← GET /api/users
│       │   └── [id]/
│       │       ├── route.js          ← GET · PUT · DELETE /api/users/:id
│       │       └── score/route.js    ← PUT /api/users/:id/score
│       └── topics/
│           ├── route.js              ← GET · POST /api/topics
│           └── [id]/route.js         ← DELETE /api/topics/:id
├── lib/
│   ├── db.js                         ← Pool de conexión a MariaDB
│   ├── gemini.js                     ← Integración con Google Gemini API
│   └── auth.js                       ← Helpers JWT
├── models/
│   └── user.model.js                 ← Queries de usuarios
├── middleware.js                     ← Verificación JWT (Next.js middleware)
└── public/                           ← Assets estáticos
```
 
---
 
## ⚙️ Variables de entorno
 
Copia `.env.example` a `.env.local` y llena los valores (Next.js carga `.env.local` automáticamente):
 
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=quizgenius
 
GEMINI_API_KEY=tu_clave_de_google_gemini
JWT_SECRET=una_clave_secreta_muy_larga
```
 
---
 
## 📊 Lógica de puntaje
 
- Cada estudiante tiene un único campo `score` en la tabla `usuarios`
- Al finalizar una evaluación se calcula: `(correctas / total) × 100`
- Se llama a `PUT /api/users/:id/score` con el valor resultante
- El `score` **solo se actualiza si el nuevo resultado es mayor al anterior**
- El campo refleja siempre el mejor puntaje histórico del estudiante
 
---
 
## 🚀 Instalación rápida
 
```bash
git clone https://github.com/tu-usuario/quiz-app.git
cd quiz-app
npm install
cp .env.example .env.local    # configurar variables
mysql -u root -p < schema.sql
npm run dev                   # http://localhost:3000
```
 
---
 
*Proyecto QuizGenius · Desarrollo Web 2025*
