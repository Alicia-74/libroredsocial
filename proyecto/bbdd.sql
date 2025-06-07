-- ##### CREACIÓN DATABASE: #####

-- Crear la base de datos
CREATE DATABASE libroredsocial;

-- Usar la base de datos
USE libroredsocial;


-- ##### CREACIÓN TABLAS: #####

-- Tabla de usuarios
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
    olid VARCHAR(50) PRIMARY KEY,  
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    cover_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de valoraciones
CREATE TABLE book_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_olid VARCHAR(50),
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
    status VARCHAR(20) DEFAULT '',
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ##### INDICES: #####

-- Índices para tabla users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Índices para tabla book_ratings
CREATE INDEX idx_book_ratings_book_olid ON book_ratings(book_olid);
CREATE INDEX idx_book_ratings_user_id ON book_ratings(user_id);
CREATE INDEX idx_book_ratings_rating ON book_ratings(rating);

-- Índices para tabla book_rankings
CREATE INDEX idx_book_rankings_book_olid ON book_rankings(book_olid);

-- Índices para tabla user_books_read
CREATE INDEX idx_user_books_read_user_id ON user_books_read(user_id);
CREATE INDEX idx_user_books_read_book_olid ON user_books_read(book_olid);

-- Índices para tabla user_books_fav
CREATE INDEX idx_user_books_fav_user_id ON user_books_fav(user_id);
CREATE INDEX idx_user_books_fav_book_olid ON user_books_fav(book_olid);

-- Índices para tabla followers
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);
CREATE UNIQUE INDEX idx_followers_unique_pair ON followers(follower_id, following_id);

-- Índices para tabla messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_pair_status ON messages(sender_id, receiver_id, status);




-- ##### FUNCIÓN: #####

DELIMITER //

CREATE FUNCTION es_contrasena_valida(pwd VARCHAR(255))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    IF CHAR_LENGTH(pwd) >= 8 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
//

DELIMITER ;

-- ##### COMPROBAR RESULTADO FUNCIÓN: #####

SELECT es_contrasena_valida('clave123');  -- Devuelve TRUE
SELECT es_contrasena_valida('123');       -- Devuelve FALSE


-- ##### PROCEDIMIENTO: #####

DELIMITER //

CREATE PROCEDURE get_mensajes_no_leidos(
    IN p_id_emisor INT,
    IN p_id_receptor INT
)
BEGIN
    SELECT 
        id,
        sender_id,
        receiver_id,
        content,
        sent_at,
        status
    FROM messages
    WHERE 
        sender_id = p_id_emisor
        AND receiver_id = p_id_receptor
        AND status = 'sent'
    ORDER BY sent_at ASC;
END //

DELIMITER ;


-- ##### COMPROBAR RESULTADO PROCEDIMIENTO: #####
CALL get_mensajes_no_leidos(2, 1);



DELIMITER //

CREATE PROCEDURE get_mensajes_leidos(
    IN p_id_emisor INT,
    IN p_id_receptor INT
)
BEGIN
    SELECT 
        id,
        sender_id,
        receiver_id,
        content,
        sent_at,
        status
    FROM messages
    WHERE 
        sender_id = p_id_emisor
        AND receiver_id = p_id_receptor
        AND status = 'read'
    ORDER BY sent_at ASC;
END //

DELIMITER ;


-- ##### COMPROBAR RESULTADO PROCEDIMIENTO: #####
CALL get_mensajes_leidos(1, 2);