package com.vedruna.libroredsocial.services.Impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vedruna.libroredsocial.persistance.model.UserBookFav;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.persistance.repository.UserBookFavRepository;
import com.vedruna.libroredsocial.services.UserBookFavServiceI;

@Service
public class UserBookFavServiceImp implements UserBookFavServiceI {
    
    @Autowired
    private UserBookFavRepository userBookFavRepository;

    public void addBookToFav(UserBookFav userBookFav) {
        userBookFavRepository.save(userBookFav);
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
