package com.vedruna.libroredsocial.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vedruna.libroredsocial.dto.UserDTO;
import com.vedruna.libroredsocial.persistance.model.User;
import com.vedruna.libroredsocial.services.FollowServiceI;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowServiceI followService;

    // Seguir a un usuario
    @PostMapping("/{id}/follow")
    public void follow(@PathVariable Integer id, @RequestHeader("userId") Integer currentUserId) {
        followService.followUser(currentUserId, id);
    }


    // Obtener seguidores de un usuario
    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(@PathVariable Integer userId) {
        List<UserDTO> followers = followService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    // Obtener usuarios que sigue un usuario
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(@PathVariable Integer userId) {
        List<UserDTO> following = followService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }

    // Dejar de seguir a un usuario
    @DeleteMapping("/{id}/unfollow")
    public void unfollow(@PathVariable Integer id, @RequestHeader("userId") Integer currentUserId) {
        followService.unfollowUser(currentUserId, id);
    }


    @GetMapping("/{id}/is-following")
    public ResponseEntity<?> isFollowing(@PathVariable Integer id, @RequestHeader("userId") Integer currentUserId) {

        boolean isFollowing = followService.isFollowing(currentUserId, id);
        return ResponseEntity.ok(isFollowing); // true o false
    }

}
