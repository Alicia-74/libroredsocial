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
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY) // Usar LAZY para evitar cargar el usuario completo innecesariamente
    @JoinColumn(name = "sender_id", referencedColumnName = "id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY) // Usar LAZY
    @JoinColumn(name = "receiver_id", referencedColumnName = "id", nullable = false)
    private User receiver;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt; // Cambiado de 'timestamp' a 'sentAt' para coherencia

    @Column(nullable = false, length = 20) // Agregamos el campo status
    private String status = "sent"; // Valor por defecto

    // @PrePersist se ejecuta antes de que una entidad sea persistida por primera vez.
    // Esto asegura que 'sentAt' y 'status' siempre se establezcan automáticamente.
    @PrePersist
    protected void onCreate() {
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
        if (this.status == null || this.status.isEmpty()) {
            this.status = "sent";
        }
    }

    // Métodos set para sender y receiver (no senderId/receiverId directamente, ya que JPA maneja objetos)
    // Lombok @Data ya genera estos, pero los incluyo aquí por si acaso necesitas un constructor específico.
    // Si usas Lombok @Data, no necesitas definirlos explícitamente a menos que añadas lógica.
    /*
    public void setSender(User sender) {
        this.sender = sender;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }
    */
    // Los setSenderId y setReceiverId que tenías no son el patrón estándar de JPA para ManyToOne.
    // Directamente setea las entidades User completas (sender y receiver) en el Message.
    // El servicio se encargará de buscar el User por ID y luego setear la entidad completa aquí.
}