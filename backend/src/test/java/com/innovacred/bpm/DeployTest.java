package com.innovacred.bpm;

import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ProcessEngineConfiguration;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.junit.jupiter.api.Test;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayInputStream;
import org.w3c.dom.*;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class DeployTest {

    @Test
    public void testDeploy() throws Exception {
        System.out.println("=== STARTING ENGINE DEPLOYMENT TEST ===");
        
        // 1. Read original
        FileInputStream in = new FileInputStream("C:/ProyectosJava/BMP/to_validate.xml");
        byte[] bytes = in.readAllBytes();
        String originalXml = new String(bytes, StandardCharsets.UTF_8);
        
        // 2. Preprocess
        String processedXml = preprocessLinkEvents(originalXml);
        
        // 3. Boot Engine
        ProcessEngineConfiguration cfg = ProcessEngineConfiguration.createStandaloneInMemProcessEngineConfiguration();
        ProcessEngine processEngine = cfg.buildProcessEngine();
        RepositoryService repositoryService = processEngine.getRepositoryService();
        
        try {
            Deployment deployment = repositoryService.createDeployment()
                    .addString("test.bpmn20.xml", processedXml)
                    .deploy();
            System.out.println("=== DEPLOYMENT SUCCESSFUL! ID: " + deployment.getId() + " ===");
        } catch (Exception e) {
            System.out.println("=== DEPLOYMENT FAILED ===");
            e.printStackTrace();
            throw e;
        }
    }

    private String preprocessLinkEvents(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        NodeList throwsList = doc.getElementsByTagNameNS("*", "intermediateThrowEvent");
        NodeList catchesList = doc.getElementsByTagNameNS("*", "intermediateCatchEvent");

        Map<String, Element> throwLinks = new HashMap<>();
        Map<String, Element> catchLinks = new HashMap<>();

        for (int i = 0; i < throwsList.getLength(); i++) {
            Element el = (Element) throwsList.item(i);
            NodeList linkDefs = el.getElementsByTagNameNS("*", "linkEventDefinition");
            if (linkDefs.getLength() > 0) {
                String name = ((Element) linkDefs.item(0)).getAttribute("name");
                throwLinks.put(name, el);
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
                Element throwEl = throwLinks.get(name);
                Element catchEl = catchLinks.get(name);

                doc.renameNode(throwEl, throwEl.getNamespaceURI(), "bpmn:exclusiveGateway");
                doc.renameNode(catchEl, catchEl.getNamespaceURI(), "bpmn:exclusiveGateway");

                removeChildrenByTagName(throwEl, "linkEventDefinition");
                removeChildrenByTagName(catchEl, "linkEventDefinition");

                Element seqFlow = doc.createElementNS(throwEl.getNamespaceURI(), "bpmn:sequenceFlow");
                String flowId = "GeneratedLinkFlow_" + name.replaceAll("[^a-zA-Z0-9]", "_");
                seqFlow.setAttribute("id", flowId);
                seqFlow.setAttribute("sourceRef", throwEl.getAttribute("id"));
                seqFlow.setAttribute("targetRef", catchEl.getAttribute("id"));

                Element outgoing = doc.createElementNS(throwEl.getNamespaceURI(), "bpmn:outgoing");
                outgoing.setTextContent(flowId);
                throwEl.appendChild(outgoing);

                Element incoming = doc.createElementNS(catchEl.getNamespaceURI(), "bpmn:incoming");
                incoming.setTextContent(flowId);
                catchEl.appendChild(incoming);

                throwEl.getParentNode().appendChild(seqFlow);
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
