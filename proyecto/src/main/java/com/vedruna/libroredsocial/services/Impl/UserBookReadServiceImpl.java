package com.vedruna.libroredsocial.services.Impl;

import com.vedruna.libroredsocial.persistance.model.Book;
import com.vedruna.libroredsocial.persistance.model.UserBookRead;
import com.vedruna.libroredsocial.persistance.repository.UserBookReadRepository;
import com.vedruna.libroredsocial.services.UserBookReadServiceI;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserBookReadServiceImpl implements UserBookReadServiceI {

    @Autowired
    private UserBookReadRepository userBookReadRepository;

    @Override
    public void addBookToRead(UserBookRead userBookRead) {
        // Verificar si ya existe la relación
        if (userBookReadRepository.existsByUserIdAndBookOlid(
            userBookRead.getUser().getId(), 
            userBookRead.getBook().getOlid())) {
            throw new RuntimeException("El libro ya está en la lista de leídos");
        }
        userBookReadRepository.save(userBookRead);
    }

    @Override
    public List<Book> getReadBooksByUserId(Integer userId) {
        List<UserBookRead> userBookReads = userBookReadRepository.findByUserId(userId);
        return userBookReads.stream()
                            .map(UserBookRead::getBook)
                            .collect(Collectors.toList());
    }

    @Override
    public boolean existsByUserIdAndBookOlid(Integer userId, String olid) {
        return userBookReadRepository.existsByUserIdAndBookOlid(userId, olid);
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