package com.vedruna.libroredsocial.services;

import java.util.List;

import com.vedruna.libroredsocial.dto.UserDTO;

public interface FollowServiceI {

    void followUser(Integer followerId, Integer followingId);

    void unfollowUser(Integer followerId, Integer followingId);

    boolean isFollowing(Integer followerId, Integer followingId);

    List<UserDTO> getFollowing(Integer userId);

    List<UserDTO> getFollowers(Integer userId);

}
