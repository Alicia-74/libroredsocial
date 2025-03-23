# Red Social para Amantes de la Lectura

**Ciclo Formativo:** DAW  
**Alumno:** Alicia Hernández Contreras

## Índice
1. [Introducción](#introducción)
2. [Funcionalidades del Proyecto](#funcionalidades-del-proyecto)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Guía de Instalación](#guía-de-instalación)
5. [Guía de Uso](#guía-de-uso)
6. [Enlace a la Documentación](#enlace-a-la-documentación)
7. [Enlace a Figma](#enlace-a-figma)
8. [Conclusión](#conclusión)
9. [Contribuciones, Agradecimientos y Referencias](#contribuciones-agredecimientos-y-referencias)
10. [Licencias](#licencias)
11. [Contacto](#contacto)

## Introducción

### Descripción del Proyecto
Este proyecto consiste en una **red social para amantes de la lectura**. Los usuarios pueden registrarse, buscar libros por categorías, agregar libros a su lista, puntuar y comentar sobre los libros, y seguir a otros usuarios. Además, pueden chatear en privado con otros usuarios sobre los libros que están leyendo y recomendar lecturas.

### Justificación
La idea de este proyecto surge de la necesidad de crear una plataforma donde los amantes de los libros puedan interactuar entre sí, compartir recomendaciones y tener un registro de los libros que desean leer. Actualmente, muchas personas buscan plataformas donde puedan compartir sus intereses literarios, y este proyecto ofrece una solución a esa demanda.

### Objetivos
- Desarrollar una plataforma interactiva y atractiva para los amantes de la lectura.
- Permitir a los usuarios puntuar y comentar libros.
- Facilitar la comunicación privada entre usuarios mediante un sistema de mensajería.
- Ofrecer un diseño responsivo que sea accesible en todos los dispositivos.

### Motivación
La pasión por los libros y la lectura, combinada con el deseo de crear una plataforma que fomente la interacción y el intercambio de recomendaciones, me inspiró a desarrollar este proyecto. Quiero ayudar a los usuarios a descubrir nuevos libros y compartir su amor por la lectura.

## Funcionalidades del Proyecto
- **Búsqueda de Libros:** Los usuarios pueden buscar libros por título, autor o categoría.
- **Valoración y Comentarios:** Los usuarios pueden puntuar y comentar los libros.
- **Lista de Libros:** Los usuarios pueden agregar libros a su lista personal de "libros que desean leer".
- **Interacción Social:** Los usuarios pueden seguir a otros, recibir notificaciones, y enviar mensajes privados.
- **Modo Oscuro/Claro:** El proyecto incluye un sistema de cambio de tema (oscuro o claro).

## Tecnologías Utilizadas
- **Backend:** Spring Boot, Spring Security, MySQL.
- **Frontend:** React, Tailwind CSS.
- **API:** [OpenLibrary API](https://openlibrary.org/developers/api) para obtener información sobre los libros.
- **Otros:** JWT para autenticación, Git para control de versiones, X para el despliegue del backend.

## Guía de Instalación

### Backend
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/libroredsocial.git
   cd libroredsocial/backend
  
2. Tener instalado el Maven

3. Crear Proyecto java
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/c201de0c-6967-469b-999f-944389e15555" />

4. Le das a Spring Boot
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/c66eb608-8580-4a98-b44a-58b5be8bddaa" />

5. Ahora le das a Maven
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/69ba07a8-62e4-4e8a-938b-d3b013de559a" />

6. version 3.4.4 (la primera que te sale)
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/26ef620b-86f6-42d6-b53d-b2745c4f551e" />

7. Java
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/55179bf8-c07a-4ad9-8516-16a96a71f30f" />

8. Le pones un nombre
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/bd741b2a-3e22-4e20-8618-ad5003d3d294" />

9. Yo le he vuelto a poner el mismo nombre que el paso anterior pero le puedes poner el titulo de tu app
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/e72a5374-6cf1-4118-b601-85a1c27b7e12" />

10. Jar 17
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/9f33876f-fb30-4b0e-a066-ce64f666c5ae" />
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/a69b9105-4c3e-47fc-b2d1-be2efd895a8e" />

11. Elegir las dependencias, en mi caso he elegido estas 5:
<img width="391" alt="java-info" src="https://github.com/user-attachments/assets/5201415a-e224-4185-b0dd-6cdf96a54f52" />

12. Configura la base de datos:
    - Asegúrate de tener MySQL instalado y en ejecución.
      ```bash
      -- Crear la base de datos
      CREATE DATABASE libroredsocial;
      
13. Configura el archivo de propiedades de la base de datos:
    - En el archivo application.properties (o application.yml), configura la conexión a la base de datos
    ```bash
    spring.datasource.url=jdbc:mysql://localhost:3306/libroredsocial
    spring.datasource.username=tu_usuario
    spring.datasource.password=tu_contraseña
    spring.jpa.hibernate.ddl-auto=update
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    spring.datasource.platform=mysql


### Frontend
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/libroredsocial.git
   cd libroredsocial/frontend

2. Instala las dependencias del frontend:
   - Asegúrate de tener Node.js y npm instalados.
   ```
   npm install
   ```
   - Crear proyecto React y acceder al proyecto:
   ```bash
   npx create-react-app nombre-del-proyecto
   cd nombre-del-proyecto

   - Instalar Tailwind CSS:
   ```bash
   npm install tailwindcss @tailwindcss/cli
   npx tailwindcss init

3. Configurar Tailwind en tu proyecto:
   - Ahora, abre el archivo src/index.css y agrega lo siguiente al inicio del archivo:
   ```bash
   /* src/index.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
4. Configurar package.json el "scripts" para ejecutar el servidor back y front a la vez (concurrently):
   - Instalar concurrently:
   ```bash
   npm install concurrently --save-dev
   
   - Configurar los scripts en package.json:
   ```bash
   "scripts": {
    "start": "concurrently \"npm run start-react\" \"npm run start-spring\"",
    "start-react": "react-scripts start",
    "start-spring": "cd .. && mvnw.cmd spring-boot:run",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },

### Comando para inicializar el proyecto
   ```bash
   npm start


## Guía de Uso

1. **Registro e Inicio de Sesión:**
   - Los usuarios pueden registrarse con un nombre de usuario, correo electrónico y contraseña. Si ya tienes una cuenta, solo tienes que iniciar sesión con tus credenciales.

2. **Exploración de Libros:**
   - Una vez dentro, podrás buscar libros por título, autor o categoría usando la barra de búsqueda y/o los botones (en caso de estar en el pc)/selección categorías (en caso de estar en el móvil).
   - Los resultados se mostrarán con la portada del libro, título y autor. Al hacer clic en un libro, se mostrará su descripción, así como la opción para puntuar y comentar sobre el libro.

3. **Puntuar y Comentar Libros:**
   - Puedes darle una calificación de 1 a 5 estrellas y dejar un comentario en cada libro.
   - Los comentarios de otros usuarios también serán visibles, y podrás seguirlos o enviarles mensajes privados si lo deseas.

4. **Agregar a Mi Lista:**
   - Al ver un libro, tendrás la opción de agregarlo a tu lista de libros que deseas leer, para que puedas llevar un registro de los libros que te interesan.

5. **Interacción con Otros Usuarios:**
   - Puedes seguir a otros usuarios y ver sus recomendaciones de libros.
   - Si quieres interactuar más, puedes enviarles mensajes privados.

6. **Modo Oscuro/Claro:**
   - Puedes cambiar el tema de la interfaz entre claro y oscuro para adaptarlo a tus preferencias personales.

7. **Cerrar Sesión:**
   - Cuando termines de usar la plataforma, puedes cerrar sesión desde tu perfil de usuario.

## Enlace a la Documentación

La documentación completa del proyecto está disponible en el siguiente enlace:

[Documentación del Proyecto](https://enlace-a-tu-documentacion)

## Enlace a Figma

La interfaz de usuario ha sido diseñada en Figma y puedes ver el diseño completo a través del siguiente enlace:

[Ver interfaz en Figma](https://www.figma.com/...)

## Conclusión

Este proyecto ha sido una gran oportunidad para poner en práctica los conocimientos adquiridos durante el ciclo formativo. Me ha permitido combinar mis intereses en la tecnología con mi pasión por la lectura, creando una plataforma donde los usuarios pueden interactuar y compartir sus recomendaciones literarias. Además, he aprendido mucho sobre el desarrollo de aplicaciones web, la integración de APIs externas, y la gestión de bases de datos. A lo largo del proceso, he mejorado mis habilidades tanto en el backend como en el frontend, y estoy satisfecha con los resultados obtenidos.

## Contribuciones, Agradecimientos y Referencias

- **Contribuciones:**  
  Agradezco a todos aquellos que han aportado ideas y sugerencias para mejorar la aplicación. También valoro el trabajo colaborativo que me ha permitido llevar a cabo este proyecto.

- **Agradecimientos:**  
  Quiero agradecer a mi tutor Joaquín por su apoyo y orientación durante el desarrollo del proyecto. Sus recomendaciones fueron clave para mejorar tanto la arquitectura como las funcionalidades del sistema.

- **Referencias:**  
  - [OpenLibrary API](https://openlibrary.org/developers/api) - API utilizada para obtener información sobre los libros.
  - [Figma](https://www.figma.com/) - Herramienta utilizada para diseñar la interfaz de usuario.
  - [Spring Boot Documentation](https://spring.io/projects/spring-boot) - Documentación oficial de Spring Boot para el desarrollo del backend.
  - [React Documentation](https://reactjs.org/docs/getting-started.html) - Documentación oficial de React para el desarrollo del frontend.
  - [Tailwind CSS](https://tailwindcss.com/docs) - Documentación oficial de Tailwind CSS para el diseño de la interfaz.


