---
title: "Diagrama de Componentes"
description: "Explicación del diagrama de componentes del proyecto."
---

El **Diagrama de Componentes** describe la arquitectura del sistema, mostrando cómo se organizan e interconectan los diferentes módulos que lo componen. Este diagrama es esencial para comprender la estructura técnica y el flujo de datos dentro de la plataforma **Red Social para Amantes de los Libros**.

## 🧩 Componentes Principales

### 🖥️ Cliente Web
- Aplicación accesible desde navegador y dispositivos móviles.
- Permite a los usuarios interactuar con la plataforma.
- Realiza solicitudes al servidor frontend.

### 🎨 Servidor Frontend
- Desarrollado con **React JS**, **Starlight** y **Tailwind CSS**.
- Maneja la interfaz gráfica.
- Permite el inicio de sesión mediante autenticación con **Google**.
- Expone documentación a través de **Swagger**.
- Se comunica con el backend vía HTTPS.

### ⚙️ Servidor Backend
- Implementado con **Spring Boot**.
- Gestiona la lógica del sistema y responde a las solicitudes del frontend.
- Se conecta con la base de datos y servicios externos como OpenLibrary.
- Expone endpoints protegidos mediante autenticación.

### 🔐 Autenticación y Autorización
- Gestionada por **Spring Security**.
- Controla el acceso y permisos de los usuarios.
- Valida identidades antes de acceder a recursos protegidos.

### 📚 API Externa: OpenLibrary
- Proporciona información adicional sobre libros.
- Se consume desde el backend mediante solicitudes JSON.

### 🗄️ Base de Datos
- Sistema de almacenamiento gestionado con **MySQL**.
- Guarda datos de usuarios, libros, listas, valoraciones, etc.

### 🐳 Despliegue con Docker
- Toda la arquitectura está contenida en imágenes de **Docker**.
- Facilita el despliegue y mantenimiento del sistema.

---

## 🔁 Flujo de Información

1. El usuario envía una solicitud desde la app.
2. El servidor frontend gestiona la solicitud.
3. Se verifica la autenticación (si aplica).
4. El backend procesa la petición y accede a los datos necesarios.
5. Puede consultar información externa (OpenLibrary).
6. El backend responde con los datos al frontend.
7. El frontend actualiza la interfaz con la información.

---

## 🖼️ Diagrama Visual

A continuación, se muestra el **Diagrama de Componentes** con las conexiones y tecnologías utilizadas:

![Diagrama de Componentes](../../../assets/diagrama-componentes.png)


> 🧠 *Este diagrama facilita la comprensión del diseño modular de la aplicación, mostrando cómo se integran las tecnologías frontend y backend, así como el uso de APIs externas y contenedores para el despliegue.*

---

## 🛠️ Herramientas Utilizadas
Este diagrama fue diseñado utilizando **Canvas**.

---

> _Conocer la arquitectura del sistema ayuda a comprender cómo fluye la información y cómo se integran las distintas tecnologías para ofrecer una experiencia completa al usuario._