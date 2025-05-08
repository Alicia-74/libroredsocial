package com.vedruna.libroredsocial.services.Impl;

import com.vedruna.libroredsocial.persistance.model.Follow;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.FollowRepository;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.services.FollowServiceI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FollowServiceImpl implements FollowServiceI {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;
    

    @Override
    public void followUser(Integer followerId, Integer followingId) {
        // Verificar si un usuario intenta seguirse a sí mismo
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("No puedes seguirte a ti mismo");
        }

        // Obtener los usuarios correspondientes
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Usuario que sigue no encontrado"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Usuario a seguir no encontrado"));

        // Verificar si el usuario ya está siguiendo a este usuario
        Follow existingFollow = followRepository.findByFollowerAndFollowing(follower, following).orElse(null);
        
        if (existingFollow != null) {
            // Si ya está siguiendo, dejar de seguir
            followRepository.delete(existingFollow);
        } else {
            // Si no está siguiendo, agregar la relación de seguimiento
            Follow follow = new Follow();
            follow.setFollower(follower);
            follow.setFollowing(following);
            followRepository.save(follow);
        }
    }


    @Override
    public void unfollowUser(Integer followerId, Integer followingId) {
        // Obtener los usuarios correspondientes
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Usuario que deja de seguir no encontrado"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Usuario a dejar de seguir no encontrado"));

        // Verificar si existe la relación de seguimiento
        Follow follow = followRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new RuntimeException("No estás siguiendo a este usuario"));

        // Eliminar la relación de seguimiento
        followRepository.delete(follow);
    }

}
