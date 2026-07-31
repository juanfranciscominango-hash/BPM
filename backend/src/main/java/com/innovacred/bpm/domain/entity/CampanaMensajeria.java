package com.innovacred.bpm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa una Campaña de Mensajería Automática iniciada
 * por un Responsable de Notificaciones desde el flujo BPM.
 */
@Entity
@Table(name = "camp_mensajeria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CampanaMensajeria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    /** Canal de envío: EMAIL, SMS, PORTAL */
    @Column(nullable = false, length = 20)
    private String canal;

    @Column(name = "asunto_email", length = 200)
    private String asuntoEmail;

    @Column(name = "cuerpo_mensaje", columnDefinition = "TEXT", nullable = false)
    private String cuerpoMensaje;

    // ---- Filtros de segmentación ----
    @Column(name = "filtro_estado_proceso", length = 50)
    private String filtroEstadoProceso;       // ACTIVO, PENDIENTE, FINALIZADO

    @Column(name = "filtro_producto", length = 100)
    private String filtroProducto;

    @Column(name = "filtro_edad_desde")
    private Integer filtroEdadDesde;

    @Column(name = "filtro_edad_hasta")
    private Integer filtroEdadHasta;

    @Column(name = "filtro_monto_minimo")
    private Double filtroMontoMinimo;

    @Column(name = "filtro_agencia", length = 100)
    private String filtroAgencia;

    // ---- Resultado de la extracción ----
    @Column(name = "total_destinatarios")
    private Integer totalDestinatarios;

    @Column(name = "total_email")
    private Integer totalEmail;

    @Column(name = "total_sms")
    private Integer totalSms;

    @Column(name = "total_portal")
    private Integer totalPortal;

    @Column(name = "total_whatsapp")
    private Integer totalWhatsapp;

    // ---- Métricas post-envío ----
    @Column(name = "enviados_exitosos")
    private Integer enviadosExitosos;

    @Column(name = "rebotes")
    private Integer rebotes;

    @Column(name = "abiertos")
    private Integer abiertos;

    // ---- Control de estado ----
    /** BORRADOR, PREVIEW, ENVIANDO, FINALIZADO, CANCELADO */
    @Column(nullable = false, length = 30)
    private String estado;

    @Column(name = "responsable", length = 100)
    private String responsable;

    @Column(name = "process_instance_id", length = 100)
    private String processInstanceId;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = "BORRADOR";
    }
}
