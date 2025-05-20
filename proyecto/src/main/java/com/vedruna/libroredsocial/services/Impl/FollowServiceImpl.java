package com.vedruna.libroredsocial.services.Impl;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.Follow;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.persistance.repository.FollowRepository;
import com.vedruna.libroredsocial.persistance.repository.UserRepository;
import com.vedruna.libroredsocial.services.FollowServiceI;

import java.util.List;
import java.util.stream.Collectors;

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


    @Override
    public boolean isFollowing(Integer followerId, Integer followingId) {
        return followRepository.existsByFollower_IdAndFollowing_Id(followerId, followingId);
    }

    @Override
    public List<UserDTO> getFollowing(Integer userId) {
          List<Follow> following = followRepository.findFollowingByUserId(userId);
          return following.stream()
            .map(f -> mapToUserDTO(f.getFollowing()))
            .collect(Collectors.toList());
    }


    @Override
    public List<UserDTO> getFollowers(Integer userId) {
       List<Follow> followers = followRepository.findFollowersByUserId(userId);
        return followers.stream()
            .map(f -> mapToUserDTO(f.getFollower()))
            .collect(Collectors.toList());
    }

    private UserDTO mapToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getImageUrl(),
                user.getDescription(),
                user.getTheme(),
                user.getCreatedAt(),
                null, // No incluimos seguidores para evitar recursividad
                null  // No incluimos seguidos para evitar recursividad
        );
    }

}
