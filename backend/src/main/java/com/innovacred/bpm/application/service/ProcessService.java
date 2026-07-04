package com.innovacred.bpm.application.service;

import com.innovacred.bpm.domain.entity.ProcessDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ProcessDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.repository.Deployment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Date;
import java.text.SimpleDateFormat;
import org.springframework.jdbc.core.JdbcTemplate;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessService {

    private final RepositoryService repositoryService;
    private final RuntimeService runtimeService;
    private final ProcessDefinitionRepository processDefinitionRepository;
    private final TableGeneratorService tableGeneratorService;
    private final MetaService metaService;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void delete(Long id) {
        ProcessDefinition processDef = processDefinitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proceso no encontrado"));
                
        if (processDef.getDeploymentId() != null) {
            try {
                repositoryService.deleteDeployment(processDef.getDeploymentId(), true); // true = cascade delete instances
            } catch (Exception e) {
                log.warn("No se pudo eliminar el deployment en Flowable: {}", e.getMessage());
            }
        }
        
        processDefinitionRepository.delete(processDef);
    }

    @Transactional
    public ProcessDefinition deploy(Long id) {
        ProcessDefinition processDef = processDefinitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proceso no encontrado"));

        log.info("Desplegando proceso: {} ({})", processDef.getName(), processDef.getKey());

        String processedXml = processDef.getBpmnXml();
        try {
            processedXml = preprocessLinkEvents(processedXml);
        } catch (Exception e) {
            log.error("Error preprocesando XML de proceso: {}", e.getMessage(), e);
            throw new RuntimeException("Error preprocesando XML del diagrama BPMN", e);
        }

        Deployment deployment = repositoryService.createDeployment()
                .name(processDef.getName())
                .key(processDef.getKey())
                .addString(processDef.getKey() + ".bpmn20.xml", processedXml)
                .deploy();

        org.flowable.engine.repository.ProcessDefinition flowableProcDef = repositoryService.createProcessDefinitionQuery()
                .deploymentId(deployment.getId())
                .singleResult();

        processDef.setDeploymentId(deployment.getId());
        processDef.setProcDefId(flowableProcDef.getId());
        processDef.setStatus("DEPLOYED");
        processDef.setVersion(flowableProcDef.getVersion());

        return processDefinitionRepository.save(processDef);
    }

    @Transactional
    public void startInstance(String processKey, Map<String, Object> variables) {
        log.info("Iniciando instancia de proceso: {}", processKey);
        if (variables == null) {
            variables = new java.util.HashMap<>();
        }
        
        // Inject authenticated user as creator and advisor
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                variables.put("usuarioCreacion", username);
                variables.put("asesorAsignado", username);
                variables.put("asesor", username);
                variables.put("initiator", username);
                org.flowable.common.engine.impl.identity.Authentication.setAuthenticatedUserId(username);
            }
        } catch (Throwable t) {
            log.warn("No se pudo establecer el usuario autenticado para la instancia: {}", t.getMessage());
        }
        
        // 1. Obtener la definición de proceso personalizada
        var procDefOpt = processDefinitionRepository.findByKey(processKey);
        
        org.flowable.engine.runtime.ProcessInstance instance;
        if (procDefOpt.isPresent() && procDefOpt.get().getProcDefId() != null && !procDefOpt.get().getProcDefId().trim().isEmpty()) {
            String procDefId = procDefOpt.get().getProcDefId();
            log.info("Iniciando instancia por ID de definición de proceso (Flowable ID): {}", procDefId);
            instance = runtimeService.startProcessInstanceById(procDefId, variables);
        } else {
            log.info("Iniciando instancia por clave de proceso (Flowable Key): {}", processKey);
            instance = runtimeService.startProcessInstanceByKey(processKey, variables);
        }
        
        // 2. Persistencia en tabla de negocio (si aplica)
        final var finalInstance = instance;
        if (procDefOpt.isPresent()) {
            var procDef = procDefOpt.get();
            try {
                // Obtener descripción de la paramétrica Parametros generales
                String sql = "SELECT p.descripcion FROM pr_paranmetros_generales p " +
                             "JOIN pr_flujo f ON CAST(p.flujo AS INTEGER) = f.id " +
                             "WHERE LOWER(f.descripcion) = LOWER(?)";
                List<String> descripciones = jdbcTemplate.queryForList(sql, String.class, procDef.getName());
                
                String caseName = null;
                if (!descripciones.isEmpty() && descripciones.get(0) != null) {
                    String prefix = descripciones.get(0);
                    String dateSuffix = new SimpleDateFormat("ddMMyyHHmmss").format(new Date());
                    caseName = prefix + dateSuffix;
                } else {
                    // Fallback
                    String dateSuffix = new SimpleDateFormat("ddMMyyHHmmss").format(new Date());
                    caseName = "CASO" + dateSuffix;
                }
                
                runtimeService.setProcessInstanceName(finalInstance.getId(), caseName);
                log.info("Process instance name set to: {}", caseName);
            } catch (Exception ex) {
                log.warn("Could not set process instance name from parametrics: {}", ex.getMessage());
                try {
                    String dateSuffix = new SimpleDateFormat("ddMMyyHHmmss").format(new Date());
                    runtimeService.setProcessInstanceName(finalInstance.getId(), "CASO" + dateSuffix);
                } catch (Exception ex2) {
                    log.warn("Could not set fallback process instance name: {}", ex2.getMessage());
                }
            }

            if (procDef.getMetaEntityId() != null) {

                var entity = metaService.listarEntidades().stream()
                        .filter(e -> e.getId().equals(procDef.getMetaEntityId()))
                        .findFirst().orElse(null);
                
                if (entity != null) {
                    var attributes = metaService.listarAtributos(entity.getId());
                    // Asegurar que la tabla existe
                    tableGeneratorService.generateTable(entity, attributes);
                    // Insertar datos
                    tableGeneratorService.insertData(entity, attributes, variables, finalInstance.getId());
                }
            }
        } else {
            // Cuando la key de Flowable no coincide con la de nuestra BD (ej: Flujo_Credito_Completo vs flujo_de_credito_completo)
            // Aseguramos que de igual manera se asigne el nombre por defecto
            log.warn("Process definition not found for key: {}. Applying generic CASO name.", processKey);
            try {
                String dateSuffix = new SimpleDateFormat("ddMMyyHHmmss").format(new Date());
                String fallbackName = "CASO" + dateSuffix;
                runtimeService.setProcessInstanceName(finalInstance.getId(), fallbackName);
                log.info("Process instance name set to fallback: {}", fallbackName);
            } catch (Exception ex) {
                log.warn("Could not set fallback process instance name for unknown key: {}", ex.getMessage());
            }
        }
    }

    public List<ProcessDefinition> listAll() {
        return processDefinitionRepository.findAll();
    }

    @Transactional
    public ProcessDefinition save(ProcessDefinition process) {
        if (process.getVersion() == 0) process.setVersion(1);
        if (process.getStatus() == null) process.setStatus("DRAFT");
        return processDefinitionRepository.save(process);
    }

    public ProcessDefinition getById(Long id) {
        return processDefinitionRepository.findById(id).orElseThrow();
    }

    public ProcessDefinition getByProcDefId(String procDefId) {
        ProcessDefinition customDef = processDefinitionRepository.findByProcDefId(procDefId).orElseGet(() -> {
            if (procDefId != null && procDefId.contains(":")) {
                String key = procDefId.split(":")[0];
                return processDefinitionRepository.findByKey(key)
                        .orElseGet(() -> processDefinitionRepository.findByKey(key.toLowerCase())
                        .orElseGet(() -> {
                            if (key.equalsIgnoreCase("Flujo_Credito_Completo")) {
                                return processDefinitionRepository.findByKey("flujo_de_credito_completo").orElse(null);
                            }
                            return null;
                        }));
            }
            return null;
        });

        // Si no tenemos bpmnXml en nuestra tabla (ej. flujos antiguos), extraerlo directo de Flowable
        if ((customDef == null || customDef.getBpmnXml() == null || customDef.getBpmnXml().isEmpty()) && procDefId != null) {
            try {
                java.io.InputStream processModel = repositoryService.getProcessModel(procDefId);
                if (processModel != null) {
                    byte[] bytes = org.springframework.util.StreamUtils.copyToByteArray(processModel);
                    String xml = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                    
                    if (customDef == null) {
                        customDef = new ProcessDefinition();
                        customDef.setProcDefId(procDefId);
                        if (procDefId.contains(":")) {
                            customDef.setKey(procDefId.split(":")[0]);
                        }
                    }
                    customDef.setBpmnXml(xml);
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener el XML desde Flowable para procDefId: {}", procDefId, e);
            }
        }

        return customDef;
    }

    private String preprocessLinkEvents(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        // 1. Convert Camunda BusinessRuleTasks to Flowable DMN ServiceTasks
        NodeList ruleTasks = doc.getElementsByTagNameNS("*", "businessRuleTask");
        for (int i = 0; i < ruleTasks.getLength(); i++) {
            Element ruleTask = (Element) ruleTasks.item(i);
            String decisionRef = ruleTask.getAttribute("camunda:decisionRef");
            if (decisionRef != null && !decisionRef.isEmpty()) {
                // Convert to ServiceTask
                doc.renameNode(ruleTask, ruleTask.getNamespaceURI(), "bpmn:serviceTask");
                ruleTask.setAttributeNS("http://flowable.org/bpmn", "flowable:type", "dmn");

                // Get resultVariable
                String resultVar = ruleTask.getAttribute("camunda:resultVariable");
                if (resultVar != null && !resultVar.isEmpty()) {
                    ruleTask.setAttributeNS("http://flowable.org/bpmn", "flowable:resultVariable", resultVar);
                }

                // Add extensionElements
                Element extElements = null;
                NodeList extList = ruleTask.getElementsByTagNameNS("*", "extensionElements");
                if (extList.getLength() > 0) {
                    extElements = (Element) extList.item(0);
                } else {
                    extElements = doc.createElementNS(ruleTask.getNamespaceURI(), "bpmn:extensionElements");
                    Node firstIncoming = null;
                    NodeList children = ruleTask.getChildNodes();
                    for (int j = 0; j < children.getLength(); j++) {
                        String localName = children.item(j).getLocalName();
                        if ("incoming".equals(localName) || "outgoing".equals(localName)) {
                            firstIncoming = children.item(j);
                            break;
                        }
                    }
                    if (firstIncoming != null) {
                        ruleTask.insertBefore(extElements, firstIncoming);
                    } else {
                        ruleTask.appendChild(extElements);
                    }
                }

                // Add decisionTableReferenceKey
                Element field = doc.createElementNS("http://flowable.org/bpmn", "flowable:field");
                field.setAttribute("name", "decisionTableReferenceKey");
                Element stringEl = doc.createElementNS("http://flowable.org/bpmn", "flowable:string");
                stringEl.setTextContent(decisionRef);
                field.appendChild(stringEl);
                extElements.appendChild(field);
            }
        }

        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.getBuffer().toString();
    }

    private void removeChildrenByTagName(Element parent, String localName) {
        NodeList children = parent.getChildNodes();
        for (int i = children.getLength() - 1; i >= 0; i--) {
            Node child = children.item(i);
            if (child.getNodeType() == Node.ELEMENT_NODE && child.getLocalName().equals(localName)) {
                parent.removeChild(child);
            }
        }
    }
}
