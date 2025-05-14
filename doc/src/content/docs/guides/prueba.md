---
title: "Casos de Prueba"
description: "Diseño de casos de prueba para las funcionalidades principales de la aplicación."
---

A continuación se presentan los casos de prueba diseñados para validar las funcionalidades clave de la plataforma **Red Social para Amantes de los Libros**.

---

## 🧭 Estructura General

- **Frontend:** Interfaz de usuario, navegación, entradas y respuestas visuales.
- **Backend:** Validaciones, lógica de negocio, persistencia y respuestas de API.

---

## ⚛️ Frontend

### 🔐 Registro e Inicio de Sesión

| ID   | Nombre del Caso      | Entrada                        | Precondiciones         | Pasos                                                                 | Resultado Esperado                        |
|------|----------------------|--------------------------------|-------------------------|-----------------------------------------------------------------------|--------------------------------------------|
| TC01 | Login válido         | Email y contraseña correctos   | Usuario registrado      | 1. Acceder al login <br> 2. Introducir datos <br> 3. Pulsar "Iniciar sesión" | Acceso exitoso al perfil del usuario       |
| TC02 | Registro nuevo       | Datos válidos                  | Ninguna                 | 1. Ir a "Registro" <br> 2. Completar formulario <br> 3. Pulsar "Registrarse" | Cuenta creada correctamente               |
| TC03 | Email duplicado      | Email ya registrado            | Usuario registrado      | Igual que TC02                                                         | Error: "Este email ya está registrado"    |

---

### 📚 Exploración de Libros

| ID   | Nombre del Caso        | Entrada                    | Precondiciones   | Pasos                                                      | Resultado Esperado                             |
|------|------------------------|----------------------------|------------------|-------------------------------------------------------------|-------------------------------------------------|
| TC04 | Buscar libro por título| Texto: “sherlock holmes”   | Libros disponibles| 1. Escribir en buscador <br> 2. Pulsar buscar              | Resultados que incluyan “sherlock holmes”       |
| TC05 | Filtrar por género     | Género: “Fantasía”         | Libros con ese género | 1. Seleccionar “Fantasía” <br> 2. Aplicar filtro      | Lista de libros con ese género                 |
| TC06 | Ver detalles de libro  | Click en un libro          | Resultado visible | 1. Click en libro listado                                 | Página de detalle del libro mostrada           |

---

### 🌟 Interacción con Libros

| ID   | Nombre del Caso  | Entrada                 | Precondiciones    | Pasos                                           | Resultado Esperado                                |
|------|------------------|-------------------------|-------------------|------------------------------------------------|----------------------------------------------------|
| TC07 | Puntuar libro    | Selección de estrellas  | Usuario logueado  | 1. Ver detalles <br> 2. Puntuar                | Puntuación guardada                                |
| TC08 | Comentar libro   | Texto de comentario     | Usuario logueado  | 1. Escribir comentario <br> 2. Pulsar enviar   | Comentario visible en la ficha del libro          |
| TC09 | Agregar a lista  | Click en "Agregar"      | Usuario logueado  | 1. Ver detalles <br> 2. Agregar a lista        | Libro añadido a lista personal del usuario         |

---

### 👥 Interacción con Usuarios

| ID   | Nombre del Caso       | Entrada                  | Precondiciones              | Pasos                                                               | Resultado Esperado                                   |
|------|-----------------------|--------------------------|-----------------------------|---------------------------------------------------------------------|-------------------------------------------------------|
| TC10 | Buscar usuario        | Texto: "Alicia"          | Usuario logueado            | 1. Buscar <br> 2. Ver resultados                                    | Se muestra el perfil correspondiente                 |
| TC11 | Seguir usuario        | Click en "Seguir"        | Usuario logueado            | 1. Buscar usuario <br> 2. Ir al perfil <br> 3. Pulsar "Seguir"      | Usuario añadido a la lista de seguidos               |
| TC12 | Enviar mensaje privado| Texto del mensaje        | Usuarios se siguen mutuamente| 1. Abrir chat <br> 2. Escribir <br> 3. Enviar                     | Mensaje enviado correctamente                         |

---

### 🎨 Personalización y Seguridad

| ID   | Nombre del Caso       | Entrada               | Precondiciones   | Pasos                                              | Resultado Esperado                             |
|------|-----------------------|-----------------------|------------------|---------------------------------------------------|-------------------------------------------------|
| TC13 | Cambiar a modo oscuro | Click en botón        | Usuario logueado | 1. Pulsar botón de modo                           | Interfaz cambia a modo oscuro                   |
| TC14 | Cerrar sesión         | Click en cerrar sesión| Usuario logueado | 1. Menú usuario <br> 2. Cerrar sesión             | Usuario deslogueado y redireccionado al login   |

---

## 🛠️ Backend

### 🔐 Registro e Inicio de Sesión

| ID   | Operación Backend         | Endpoint                    | Método | Validaciones                                                        | Resultado Esperado                            |
|------|---------------------------|-----------------------------|--------|----------------------------------------------------------------------|------------------------------------------------|
| TC01 | Autenticar usuario        | `/api/auth/login`           | POST   | Email y contraseña válidos, hash, token generado                    | Devuelve JWT + perfil del usuario              |
| TC02 | Registrar usuario         | `/api/auth/register`        | POST   | Email único, campos requeridos, contraseña segura                   | Crea nuevo usuario en DB, devuelve confirmación|
| TC03 | Validar duplicado         | `/api/auth/register`        | POST   | Verifica email en DB                                                | Devuelve error de duplicado                   |

---

### 📚 Exploración de Libros

| ID   | Operación Backend         | Endpoint                    | Método | Validaciones                                | Resultado Esperado                                |
|------|---------------------------|-----------------------------|--------|----------------------------------------------|----------------------------------------------------|
| TC04 | Buscar libros por título  | `/api/books/search`         | GET    | Parámetro de búsqueda presente               | Devuelve libros con título coincidente             |
| TC05 | Filtrar libros por género | `/api/books/filter`         | GET    | Género válido                                | Devuelve libros del género especificado            |
| TC06 | Obtener detalle de libro  | `/api/books/:id`            | GET    | ID válido, libro existente                   | Devuelve información detallada del libro           |

---

### 🌟 Interacción con Libros

| ID   | Operación Backend     | Endpoint                      | Método | Validaciones                                       | Resultado Esperado                         |
|------|-----------------------|-------------------------------|--------|----------------------------------------------------|---------------------------------------------|
| TC07 | Puntuar libro         | `/api/books/:id/rate`         | POST   | Usuario autenticado, valor entre 1 y 5            | Guarda la puntuación                       |
| TC08 | Comentar libro        | `/api/books/:id/comment`      | POST   | Usuario autenticado, texto presente               | Guarda y devuelve comentario nuevo         |
| TC09 | Agregar a lista       | `/api/user/books/:id/add`     | POST   | Usuario autenticado, libro válido                 | Asocia libro a lista del usuario           |

---

### 👥 Interacción con Usuarios

| ID   | Operación Backend         | Endpoint                         | Método | Validaciones                                      | Resultado Esperado                            |
|------|---------------------------|----------------------------------|--------|---------------------------------------------------|------------------------------------------------|
| TC10 | Buscar usuarios           | `/api/users/search`              | GET    | Texto presente, búsqueda parcial                  | Devuelve lista de usuarios coincidentes        |
| TC11 | Seguir usuario            | `/api/users/:id/follow`          | POST   | Usuario autenticado, no seguirse a sí mismo      | Añade a lista de seguidos del usuario          |
| TC12 | Enviar mensaje privado    | `/api/messages/send`             | POST   | Ambos usuarios se siguen, texto no vacío         | Guarda y notifica nuevo mensaje                |

---

### 🎨 Personalización y Seguridad

| ID   | Operación Backend      | Endpoint               | Método | Validaciones                     | Resultado Esperado                                |
|------|------------------------|------------------------|--------|-----------------------------------|----------------------------------------------------|
| TC13 | Cambiar preferencias   | `/api/user/settings`   | PATCH  | Usuario autenticado, modo válido | Guarda configuración del usuario                  |
| TC14 | Cerrar sesión          | N/A (token en frontend)| N/A    | N/A (solo se borra token local)  | Usuario queda desautenticado                      |

---

> Estos casos de prueba cubren la validación tanto visual como funcional de la aplicación, considerando su arquitectura cliente-servidor.
