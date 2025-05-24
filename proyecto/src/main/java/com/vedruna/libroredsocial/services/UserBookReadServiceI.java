package com.vedruna.libroredsocial.services;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import java.util.List;

public interface UserBookReadServiceI {

    void addBookToRead(UserBookRead userBookRead); // Método para añadir un libro a la lista de leídos
    List<UserBookRead> getBooksReadByUser(Integer userId); // Método para obtener los libros leídos por un usuario
    void removeBookFromRead(Integer userId, String olid);

    boolean existsByUserIdAndBookOlid(Integer userId, String olid); // Método para verificar si un libro ya está en la lista de leídos
    List<Book> getReadBooksByUserId(Integer userId);
}
