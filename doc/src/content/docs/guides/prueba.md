---
title: "Casos de Prueba"
description: "Diseño de casos de prueba para las funcionalidades principales de la aplicación."
---

A continuación se presentan los casos de prueba diseñados para validar las funcionalidades clave de la plataforma **Red Social para Amantes de los Libros**.

---

## 🔐 Registro e Inicio de Sesión

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead style="background-color: #f3f4f6;">
    <tr>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">ID</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Nombre del Caso</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Entrada</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Precondiciones</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Pasos</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Resultado Esperado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC01</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Login válido</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Email y contraseña correctos</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario registrado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Acceder al login <br> 2. Introducir datos <br> 3. Pulsar "Iniciar sesión"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Acceso exitoso al perfil del usuario</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC02</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Registro nuevo</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Datos válidos (email, nombre, contraseña)</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Ninguna</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Ir a "Registro" <br> 2. Completar formulario <br> 3. Pulsar "Registrarse"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Cuenta creada correctamente</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC03</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Email duplicado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Email ya registrado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario registrado con ese email</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Igual que TC02</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Error: "Este email ya está registrado"</td>
    </tr>
  </tbody>
</table>

---

## 📚 Exploración de Libros

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead style="background-color: #f3f4f6;">
    <tr>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">ID</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Nombre del Caso</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Entrada</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Precondiciones</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Pasos</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Resultado Esperado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC04</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Buscar libro por título</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Texto: “sherlock holmes”</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Libros disponibles</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Escribir “sherlock holmes” en buscador <br> 2. Pulsar buscar</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Resultados que incluyan “sherlock holmes”</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC05</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Filtrar por género</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Género: “Fantasía”</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Libros con ese género</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Seleccionar “Fantasía” <br> 2. Aplicar filtro</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Lista de libros con ese género</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC06</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Ver detalles de libro</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Click en un libro</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Resultado visible</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Click en libro listado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Página de detalle del libro mostrada</td>
    </tr>
  </tbody>
</table>

---

## 🌟 Interacción con Libros

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead style="background-color: #f3f4f6;">
    <tr>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">ID</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Nombre del Caso</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Entrada</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Precondiciones</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Pasos</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Resultado Esperado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC07</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Puntuar libro</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Selección de 1 a 5 estrellas</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Ver detalles <br> 2. Puntuar</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Puntuación guardada</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC08</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Comentar libro</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Texto de comentario</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Escribir comentario <br> 2. Pulsar enviar</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Comentario visible en la ficha del libro</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC09</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Agregar a lista</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Click en "Agregar"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Ver detalles <br> 2. Agregar a lista</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Libro añadido a lista personal del usuario</td>
    </tr>
  </tbody>
</table>

---

## 👥 Interacción con Usuarios

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead style="background-color: #f3f4f6;">
    <tr>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">ID</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Caso de Prueba</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Entrada</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Precondiciones</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Pasos</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Resultado Esperado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC10</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Buscar usuario por nombre</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Texto en campo de búsqueda: "Alicia"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Ir a la pantalla de inicio <br> 2. Escribir "Alicia" en el buscador <br> 3. Ver resultados</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Se muestra el perfil de usuario con nombre que contenga "Alicia"</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC11</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Seguir a otro usuario</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Click en "Seguir"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Buscar usuarios por nombre <br> 2. Acceder al perfil desde los resultados <br> 3. Pulsar "Seguir"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario añadido a lista de seguidos</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC12</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Enviar mensaje privado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Texto del mensaje</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuarios se siguen mutuamente</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Abrir chat <br> 2. Escribir el mensaje <br> 3. Pulsar "Enviar"</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Mensaje enviado correctamente</td>
    </tr>
  </tbody>
</table>

---

## 🎨 Personalización y Seguridad

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead style="background-color: #f3f4f6;">
    <tr>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">ID</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Nombre del Caso</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Entrada</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Precondiciones</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Pasos</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Resultado Esperado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC13</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Cambiar a modo oscuro</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Click en botón</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Pulsar botón de modo</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Interfaz cambia a modo oscuro</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">TC14</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Cerrar sesión</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Click en “Cerrar sesión”</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario logueado</td>
      <td style="padding: 8px; border: 1px solid #ddd;">1. Pulsar menú usuario <br> 2. Cerrar sesión</td>
      <td style="padding: 8px; border: 1px solid #ddd;">Usuario deslogueado y redireccionado al login</td>
    </tr>
  </tbody>
</table>

> Estos casos de prueba pueden ser ampliados y refinados conforme avance el desarrollo de la aplicación.
