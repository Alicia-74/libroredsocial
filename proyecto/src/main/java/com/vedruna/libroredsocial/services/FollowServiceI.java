package com.vedruna.libroredsocial.services;

public interface FollowServiceI {

    void followUser(Integer followerId, Integer followingId);

    void unfollowUser(Integer followerId, Integer followingId);
}
