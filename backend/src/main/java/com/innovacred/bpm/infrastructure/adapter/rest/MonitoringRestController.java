package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/monitoring")
@RequiredArgsConstructor
public class MonitoringRestController {

    private final MonitoringService monitoringService;

    @GetMapping("/instance/{instanceId}/active-nodes")
    public List<String> getActiveNodes(@PathVariable String instanceId) {
        return monitoringService.getActiveActivityIds(instanceId);
    }

    @GetMapping("/instance/{instanceId}/audit")
    public List<Map<String, Object>> getAuditTrail(@PathVariable String instanceId) {
        return monitoringService.getAuditTrail(instanceId);
    }

    @GetMapping("/instance/{instanceId}/xml")
    public String getXml(@PathVariable String instanceId) {
        return monitoringService.getBpmnXmlByInstance(instanceId);
    }
}
