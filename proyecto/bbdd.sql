-- Crear la base de datos
CREATE DATABASE libroredsocial;

-- Usar la base de datos recién creada
USE libroredsocial;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    description TEXT, -- Descripción del usuario
    image_url VARCHAR(255), -- Foto de perfil
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    theme VARCHAR(10) DEFAULT 'light' -- Tema: 'light' o 'dark'
);

-- Tabla de libros
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    cover_url VARCHAR(255), -- URL de la portada
    description TEXT, -- Descripción del libro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de valoraciones de libros (1 a 5 estrellas)
CREATE TABLE book_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    user_id INT,
    rating INT, -- Calificación de 1 a 5
    comment TEXT, -- Comentario del usuario sobre el libro
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de ranking de libros (calculado con valoraciones)
CREATE TABLE book_rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    total_ratings INT DEFAULT 0, -- Número total de valoraciones
    average_rating FLOAT DEFAULT 0, -- Promedio de valoraciones
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Tabla de libros leídos por los usuarios
CREATE TABLE user_books_read (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Tabla de libros favoritos de los usuarios
CREATE TABLE user_books_fav (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Tabla para gestionar seguidores
CREATE TABLE followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT,
    following_id INT,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de mensajes privados entre usuarios
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
