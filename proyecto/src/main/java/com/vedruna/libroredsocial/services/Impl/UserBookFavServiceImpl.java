package com.vedruna.libroredsocial.services.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.UserBookFav;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.persistance.repository.UserBookFavRepository;
import com.vedruna.libroredsocial.services.UserBookFavServiceI;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class UserBookFavServiceImpl implements UserBookFavServiceI {

    @Autowired
    private UserBookFavRepository userBookFavRepository;

    @Override
    public void addBookToFav(UserBookFav userBookFav) {
        // Verificar si ya existe la relación
        if (userBookFavRepository.existsByUserIdAndBookOlid(
            userBookFav.getUser().getId(), 
            userBookFav.getBook().getOlid())) {
            throw new RuntimeException("El libro ya está en la lista de favoritos");
        }
        userBookFavRepository.save(userBookFav);
    }

    @Override
    public List<Book> getFavoriteBooksByUserId(Integer userId) {
        List<UserBookFav> userBookFavs = userBookFavRepository.findByUserId(userId);
        return userBookFavs.stream()
                            .map(UserBookFav::getBook)
                            .collect(Collectors.toList());
    }

    @Override
    public boolean existsByUserIdAndBookOlid(Integer userId, String olid) {
        return userBookFavRepository.existsByUserIdAndBookOlid(userId, olid);
    }

    public List<UserBookFav> getBooksFavByUser(Integer userId) {
        return userBookFavRepository.findByUserId(userId);
    }

    @Override
    public void removeBookFromFav(Integer userId, String olid) {
        UserBookFav userBookFav = userBookFavRepository.findByUserIdAndBookOlid(userId, olid);
        if (userBookFav != null) {
            userBookFavRepository.delete(userBookFav);
        }
    }
    
}
