package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.persistance.model.Follow;
import com.vedruna.libroredsocial.persistance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    void deleteByFollowerAndFollowing(User follower, User following);

    boolean existsByFollower_IdAndFollowing_Id(Integer followerId, Integer followingId);

    // Obtener todos los seguidores de un usuario (quienes lo siguen)
    @Query("SELECT f FROM Follow f WHERE f.following.id = :userId")
    List<Follow> findFollowersByUserId(@Param("userId") Integer userId);
    
    // Obtener todos los usuarios que sigue un usuario (a quienes sigue)
    @Query("SELECT f FROM Follow f WHERE f.follower.id = :userId")
    List<Follow> findFollowingByUserId(@Param("userId") Integer userId);
    
}
