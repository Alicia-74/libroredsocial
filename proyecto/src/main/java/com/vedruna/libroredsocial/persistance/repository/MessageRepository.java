package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.persistance.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Indica que esta interfaz es un componente de repositorio de Spring
public interface MessageRepository extends JpaRepository<Message, Integer> {

    // Consulta personalizada para obtener todos los mensajes entre dos usuarios
    // Ordenados por la fecha de envío de forma ascendente.
    // Usamos OR para cubrir ambos casos: (sender=user1 AND receiver=user2) OR (sender=user2 AND receiver=user1)
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id) ORDER BY m.sentAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1Id") Integer user1Id, @Param("user2Id") Integer user2Id);

    // Método para encontrar los chats más recientes de un usuario.
    // Esto es útil para la vista de "bandeja de entrada" de mensajes, mostrando el último mensaje de cada conversación.
    // Puedes ajustar esta consulta según la lógica exacta que necesites para tu "bandeja de entrada".
    @Query(value = "SELECT * FROM ( " +
            "SELECT *, " +
            "ROW_NUMBER() OVER(PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id) ORDER BY sent_at DESC) as rn " +
            "FROM libreoredsocial.messages " +
            "WHERE sender_id = :userId OR receiver_id = :userId " +
            ") AS subquery " +
            "WHERE rn = 1 " +
            "ORDER BY sent_at DESC", nativeQuery = true)
    List<Message> findLatestMessagesForUser(@Param("userId") Integer userId);
}