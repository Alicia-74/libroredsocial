---
title: "Diagrama de Secuencia"
description: "Explicación del diagrama de Secuencia del proyecto."
---

El **Diagrama de Secuencia** muestra cómo interactúan los distintos componentes del sistema a lo largo del tiempo, permitiendo visualizar el flujo de mensajes entre objetos, controladores y servicios. Es especialmente útil para representar el comportamiento dinámico de un caso de uso específico y entender el orden en que se ejecutan las operaciones.

En este caso, se ilustra el flujo completo del **inicio de sesión**, desde que el usuario introduce sus credenciales hasta que el sistema verifica los datos y devuelve una respuesta.

---

## 📝 Participantes Principales

- **Usuario**: La persona que interactúa con la interfaz para iniciar sesión.
- **Interfaz**: La interfaz de usuario que recibe las credenciales y muestra el resultado.
- **ControladorAuth**: El controlador que gestiona la autenticación.
- **ServicioAuth**: El servicio que valida las credenciales del usuario.
- **BaseDeDatos**: La base de datos que almacena los usuarios y sus credenciales.

---

## 📌 Descripción del Flujo

### 🔐 Flujo de Inicio de Sesión

1. **Introducción de credenciales**: El **Usuario** ingresa su **email** y **contraseña** en la **Interfaz**.
2. **Envío de credenciales**: La **Interfaz** envía las credenciales al **ControladorAuth**.
3. **Validación de credenciales**: El **ControladorAuth** pide al **ServicioAuth** que valide las credenciales.
4. **Consulta de usuario en la base de datos**: El **ServicioAuth** busca el usuario en la **BaseDeDatos** mediante el **email** proporcionado.
5. **Recuperación de datos**: La **BaseDeDatos** devuelve los datos del usuario al **ServicioAuth**.
6. **Verificación de contraseña**: El **ServicioAuth** verifica si la contraseña proporcionada es correcta.
7. **Resultado de autenticación**: El **ServicioAuth** devuelve el resultado de la autenticación al **ControladorAuth**.
8. **Mostrar resultado**: El **ControladorAuth** envía el resultado a la **Interfaz**.
9. **Acceso permitido o error**: La **Interfaz** muestra al **Usuario** si el acceso fue exitoso o si hubo un error.

---

## 🖼️ Diagrama Visual

A continuación, se presenta el **Diagrama de Secuencia - Inicio de Sesión**, que muestra cómo los distintos componentes interactúan durante el proceso de autenticación:

![Diagrama de Secuencia - Inicio de Sesión](../../../assets/Diagrama%20de%20secuencia.png)

> **Nota:** Este diagrama proporciona una representación visual del flujo de mensajes entre los diferentes componentes del sistema durante el proceso de inicio de sesión.

---

## 🛠️ Herramientas Utilizadas

Este diagrama fue diseñado en **Lucidchart**.

---

> _Este diagrama es esencial para comprender cómo interactúan los componentes del sistema y el flujo de información durante el proceso de inicio de sesión._
