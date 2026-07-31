package com.innovacred.bpm.domain.dto;

import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
public class CaseQueryRequest {
    
    // Filtros de Proceso
    private String processDefinitionKey; // Ej: FLUJO_CREDITO
    private String status;               // OPEN, CLOSED, ALL
    private Date createdAfter;
    private Date createdBefore;
    
    // Filtros de Usuario
    private String startedBy;
    private String currentAssignee;
    
    // Filtros Dinámicos (Datos de Negocio)
    private Map<String, Object> variables; // Ej: {"cedula": "123456", "monto": 5000}
    
    // Paginación
    private int start = 0;
    private int size = 10;
}
