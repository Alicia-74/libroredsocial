-- Crear la base de datos
CREATE DATABASE libroredsocial;

-- Usar la base de datos
USE libroredsocial;

-- Tabla de usuarios (sin cambios)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    description TEXT,
    image_url LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    theme VARCHAR(10) DEFAULT 'light'
);

-- Tabla de libros con OLID como clave primaria
CREATE TABLE books (
    olid VARCHAR(50) PRIMARY KEY,  -- OLID como ID principal
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    cover_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de valoraciones
CREATE TABLE book_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_olid VARCHAR(50),  -- Cambiado de book_id a book_olid
    user_id INT,
    rating INT,
    comment TEXT,
    FOREIGN KEY (book_olid) REFERENCES books(olid) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ranking de libros
CREATE TABLE book_rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_olid VARCHAR(50),
    total_ratings INT DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    FOREIGN KEY (book_olid) REFERENCES books(olid) ON DELETE CASCADE
);

-- Libros leídos por usuario
CREATE TABLE user_books_read (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_olid VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_olid) REFERENCES books(olid) ON DELETE CASCADE
);

-- Libros favoritos
CREATE TABLE user_books_fav (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_olid VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_olid) REFERENCES books(olid) ON DELETE CASCADE
);

-- Seguidores
CREATE TABLE followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT,
    following_id INT,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mensajes
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
