package com.innovacred.bpm;

import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.flowable.bpmn.model.BpmnModel;
import org.flowable.validation.ProcessValidator;
import org.flowable.validation.ProcessValidatorFactory;
import org.flowable.validation.ValidationError;
import org.junit.jupiter.api.Test;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;
import java.util.List;
import org.w3c.dom.*;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class ValidateBPMNTest {

    @Test
    public void testBpmn() throws Exception {
        System.out.println("=== STARTING VALIDATION WITH PREPROCESSOR ===");
        
        // 1. Read original
        FileInputStream in = new FileInputStream("C:/ProyectosJava/BMP/to_validate.xml");
        byte[] bytes = in.readAllBytes();
        String originalXml = new String(bytes, StandardCharsets.UTF_8);
        
        // 2. Preprocess Link Events -> Gateways
        String processedXml = preprocessLinkEvents(originalXml);
        
        // 3. Validate processed XML
        XMLInputFactory xif = XMLInputFactory.newInstance();
        InputStreamReader inReader = new InputStreamReader(new ByteArrayInputStream(processedXml.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8);
        XMLStreamReader xtr = xif.createXMLStreamReader(inReader);
        
        BpmnXMLConverter converter = new BpmnXMLConverter();
        BpmnModel bpmnModel = converter.convertToBpmnModel(xtr);
        
        ProcessValidator validator = new ProcessValidatorFactory().createDefaultProcessValidator();
        List<ValidationError> errors = validator.validate(bpmnModel);
        
        if (errors.isEmpty()) {
            System.out.println("=== NO ERRORS FOUND. TRANSFORMATION SUCCESSFUL! ===");
        } else {
            for (ValidationError error : errors) {
                System.out.println("VALIDATION ERROR: " + error.toString());
            }
        }
    }

    private String preprocessLinkEvents(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        // Find all Throw and Catch events
        NodeList throwsList = doc.getElementsByTagNameNS("*", "intermediateThrowEvent");
        NodeList catchesList = doc.getElementsByTagNameNS("*", "intermediateCatchEvent");

        Map<String, Element> throwLinks = new HashMap<>(); // linkName -> element
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

        // Convert them to exclusiveGateways
        for (String name : throwLinks.keySet()) {
            if (catchLinks.containsKey(name)) {
                Element throwEl = throwLinks.get(name);
                Element catchEl = catchLinks.get(name);

                // Change tag names to exclusiveGateway
                doc.renameNode(throwEl, throwEl.getNamespaceURI(), "bpmn:exclusiveGateway");
                doc.renameNode(catchEl, catchEl.getNamespaceURI(), "bpmn:exclusiveGateway");

                // Remove linkEventDefinition children
                removeChildrenByTagName(throwEl, "linkEventDefinition");
                removeChildrenByTagName(catchEl, "linkEventDefinition");

                // Create a sequence flow connecting them
                Element seqFlow = doc.createElementNS(throwEl.getNamespaceURI(), "bpmn:sequenceFlow");
                String flowId = "GeneratedLinkFlow_" + name.replaceAll("[^a-zA-Z0-9]", "_");
                seqFlow.setAttribute("id", flowId);
                seqFlow.setAttribute("sourceRef", throwEl.getAttribute("id"));
                seqFlow.setAttribute("targetRef", catchEl.getAttribute("id"));

                // Add outgoing to Throw, incoming to Catch
                Element outgoing = doc.createElementNS(throwEl.getNamespaceURI(), "bpmn:outgoing");
                outgoing.setTextContent(flowId);
                throwEl.appendChild(outgoing);

                Element incoming = doc.createElementNS(catchEl.getNamespaceURI(), "bpmn:incoming");
                incoming.setTextContent(flowId);
                catchEl.appendChild(incoming);

                // Add sequenceFlow to process
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
