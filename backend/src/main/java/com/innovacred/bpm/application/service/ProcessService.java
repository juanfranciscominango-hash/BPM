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
        procDefOpt.ifPresent(procDef -> {
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
        });
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
        return processDefinitionRepository.findByProcDefId(procDefId).orElse(null);
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

        // 2. Preprocess Link Events -> Gateways
        NodeList throwsList = doc.getElementsByTagNameNS("*", "intermediateThrowEvent");
        NodeList catchesList = doc.getElementsByTagNameNS("*", "intermediateCatchEvent");

        Map<String, java.util.List<Element>> throwLinks = new HashMap<>();
        Map<String, Element> catchLinks = new HashMap<>();

        for (int i = 0; i < throwsList.getLength(); i++) {
            Element el = (Element) throwsList.item(i);
            NodeList linkDefs = el.getElementsByTagNameNS("*", "linkEventDefinition");
            if (linkDefs.getLength() > 0) {
                String name = ((Element) linkDefs.item(0)).getAttribute("name");
                throwLinks.computeIfAbsent(name, k -> new java.util.ArrayList<>()).add(el);
            }
        }

        for (int i = 0; i < catchesList.getLength(); i++) {
            Element el = (Element) catchesList.item(i);
            NodeList linkDefs = el.getElementsByTagNameNS("*", "linkEventDefinition");
            if (linkDefs.getLength() > 0) {
                String name = ((Element) linkDefs.item(0)).getAttribute("name");
                catchLinks.put(name, el);
            }
        }

        for (String name : throwLinks.keySet()) {
            if (catchLinks.containsKey(name)) {
                Element catchEl = catchLinks.get(name);
                
                // Convert Catch Event to Gateway
                doc.renameNode(catchEl, catchEl.getNamespaceURI(), "bpmn:exclusiveGateway");
                removeChildrenByTagName(catchEl, "linkEventDefinition");

                int index = 0;
                for (Element throwEl : throwLinks.get(name)) {
                    // Convert Throw Event to Gateway
                    doc.renameNode(throwEl, throwEl.getNamespaceURI(), "bpmn:exclusiveGateway");
                    removeChildrenByTagName(throwEl, "linkEventDefinition");

                    // Create sequence flow
                    Element seqFlow = doc.createElementNS(throwEl.getNamespaceURI(), "bpmn:sequenceFlow");
                    String flowId = "GeneratedLinkFlow_" + name.replaceAll("[^a-zA-Z0-9]", "_") + "_" + (index++);
                    seqFlow.setAttribute("id", flowId);
                    seqFlow.setAttribute("sourceRef", throwEl.getAttribute("id"));
                    seqFlow.setAttribute("targetRef", catchEl.getAttribute("id"));

                    Element outgoing = doc.createElementNS(throwEl.getNamespaceURI(), "bpmn:outgoing");
                    outgoing.setTextContent(flowId);
                    throwEl.appendChild(outgoing);

                    Element incoming = doc.createElementNS(catchEl.getNamespaceURI(), "bpmn:incoming");
                    incoming.setTextContent(flowId);
                    
                    Node firstOutgoing = null;
                    NodeList children = catchEl.getChildNodes();
                    for (int j = 0; j < children.getLength(); j++) {
                        if ("outgoing".equals(children.item(j).getLocalName())) {
                            firstOutgoing = children.item(j);
                            break;
                        }
                    }
                    if (firstOutgoing != null) {
                        catchEl.insertBefore(incoming, firstOutgoing);
                    } else {
                        catchEl.appendChild(incoming);
                    }

                    throwEl.getParentNode().appendChild(seqFlow);
                }
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
