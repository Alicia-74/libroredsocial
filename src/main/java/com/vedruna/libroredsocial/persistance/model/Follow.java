package com.vedruna.libroredsocial.persistance.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "followers", schema = "libroredsocial")
@Data
@NoArgsConstructor
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "follower_id", referencedColumnName = "id", nullable = false)
    private User follower;  // Usuario que sigue a otro

    @ManyToOne
    @JoinColumn(name = "following_id", referencedColumnName = "id", nullable = false)
    private User following; // Usuario que es seguido

     // Métodos para establecer follower_id y following_id directamente

     public void setFollowerId(Integer followerId) {
        if (this.follower == null) {
            this.follower = new User();  // Si no existe un objeto 'follower', inicialízalo
        }
        this.follower.setId(followerId);  // Establece el id del 'follower'
    }

    public void setFollowingId(Integer followingId) {
        if (this.following == null) {
            this.following = new User();  // Si no existe un objeto 'following', inicialízalo
        }
        this.following.setId(followingId);  // Establece el id del 'following'
    }


}
