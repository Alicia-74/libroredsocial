package com.vedruna.libroredsocial.services;

import java.util.List;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.UserBookFav;

public interface UserBookFavServiceI {

    void addBookToFav(UserBookFav userBookFav);

    List<UserBookFav> getBooksFavByUser(Integer userId);

    void removeBookFromFav(Integer userId, String olid);

    boolean existsByUserIdAndBookOlid(Integer userId, String olid); // Método para verificar si un libro ya está en la lista de favoritos

    List<Book> getFavoriteBooksByUserId(Integer userId);

}
