package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.persistance.model.Follow;
import com.vedruna.libroredsocial.persistance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    void deleteByFollowerAndFollowing(User follower, User following);

    
}
