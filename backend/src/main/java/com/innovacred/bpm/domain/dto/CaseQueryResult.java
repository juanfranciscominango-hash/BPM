package com.innovacred.bpm.domain.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
@Builder
public class CaseQueryResult {
    
    private String processInstanceId;
    private String processDefinitionKey;
    private String processDefinitionName;
    private String startedBy;
    private Date startTime;
    private Date endTime;
    private String currentAssignee;
    
    // Variables de negocio que el usuario haya decidido exponer en la tabla de resultados
    private Map<String, Object> variables;
}
