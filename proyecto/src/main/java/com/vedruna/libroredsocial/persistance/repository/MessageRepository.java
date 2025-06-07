package com.vedruna.libroredsocial.persistance.repository;

import com.vedruna.libroredsocial.persistance.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id) ORDER BY m.sentAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1Id") Integer user1Id, @Param("user2Id") Integer user2Id);

    /**
     * Cuenta los mensajes no leídos para un receptor específico
     * @param receiverId ID del usuario receptor
     * @param status Estado del mensaje ("sent" para no leídos)
     * @return Número de mensajes no leídos
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.status = :status")
    Long countByReceiverIdAndStatus(@Param("receiverId") Integer receiverId, @Param("status") String status);

    /**
     * Cuenta los mensajes no leídos de un remitente específico para el usuario actual
     * @param senderId ID del remitente
     * @param receiverId ID del receptor (usuario actual)
     * @param status Estado del mensaje
     * @return Número de mensajes no leídos
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.status = :status")
    Long countUnreadFromSender(@Param("senderId") Integer senderId, 
                             @Param("receiverId") Integer receiverId, 
                             @Param("status") String status);

    // Método para marcar una conversación como leída
    @Modifying
    @Query("UPDATE Message m SET m.status = 'read' WHERE m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.status = 'sent'")
    void markConversationAsRead(@Param("senderId") Integer senderId, @Param("receiverId") Integer receiverId);
    
    // Método para marcar un mensaje específico como leído
    @Modifying
    @Query("UPDATE Message m SET m.status = 'read' WHERE m.id = :messageId")
    void markAsRead(@Param("messageId") Integer messageId);

    // Método para obtener el conteo de mensajes no leídos por remitente
    @Query("SELECT m.sender.id, COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.status = 'sent' GROUP BY m.sender.id")
    List<Object[]> countUnreadBySender(@Param("receiverId") Integer receiverId);

    // Método para obtener los últimos mensajes relevantes para un usuario
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.sentAt DESC")
    List<Message> findLatestMessagesForUser(@Param("userId") Integer userId);

}