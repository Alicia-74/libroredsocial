package com.vedruna.libroredsocial.persistance.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "messages", schema = "libroredsocial")
@Data
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "sender_id", referencedColumnName = "id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", referencedColumnName = "id", nullable = false)
    private User receiver;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    // Métodos set para sender_id y receiver_id (si realmente los necesitas)

    public void setSenderId(Integer senderId) {
        if (this.sender == null) {
            this.sender = new User();  // Si no existe el sender, inicializa el objeto User
        }
        this.sender.setId(senderId);  // Establece el id del sender
    }

    public void setReceiverId(Integer receiverId) {
        if (this.receiver == null) {
            this.receiver = new User();  // Si no existe el receiver, inicializa el objeto User
        }
        this.receiver.setId(receiverId);  // Establece el id del receiver
    }
}
