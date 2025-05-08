package com.vedruna.libroredsocial.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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


    // Dejar de seguir a un usuario
    @DeleteMapping("/{id}/unfollow")
    public void unfollow(@PathVariable Integer id, @RequestHeader("userId") Integer currentUserId) {
        followService.unfollowUser(currentUserId, id);
    }
}
