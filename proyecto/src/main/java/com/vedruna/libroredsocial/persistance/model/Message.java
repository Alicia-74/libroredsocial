package com.vedruna.libroredsocial.persistance.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "messages", schema = "libroredsocial") // Mantienes tu esquema
@Data // Genera getters, setters, toString, equals y hashCode de Lombok
@NoArgsConstructor // Genera un constructor sin argumentos
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relación con User que envía el mensaje
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // Relación con User que recibe el mensaje
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(length = 20, nullable = false)
    private String status = ""; // Por defecto cadena vacía
}