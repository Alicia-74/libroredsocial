package com.vedruna.libroredsocial.services.Impl;

import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.persistance.repository.UserBookReadRepository;
import com.vedruna.libroredsocial.services.UserBookReadServiceI;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserBookReadServiceImp implements UserBookReadServiceI {
    
    private final UserBookReadRepository userBookReadRepository;

    public UserBookReadServiceImp(UserBookReadRepository userBookReadRepository) {
        this.userBookReadRepository = userBookReadRepository;
    }

    @Override
    public void addBookToRead(UserBookRead userBookRead) {
        userBookReadRepository.save(userBookRead);
    }

    @Override
    public List<UserBookRead> getBooksReadByUser(Integer userId) {
        return userBookReadRepository.findByUserId(userId);
    }

    @Override
    public void removeBookFromRead(Integer userId, String olid) {
        UserBookRead userBookRead = userBookReadRepository.findByUserIdAndBookOlid(userId, olid);
        if (userBookRead != null) {
            userBookReadRepository.delete(userBookRead);
        }
    }
}