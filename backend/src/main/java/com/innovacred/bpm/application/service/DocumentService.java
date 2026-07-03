package com.innovacred.bpm.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovacred.bpm.domain.entity.DocumentDefinition;
import com.innovacred.bpm.domain.entity.StoredDocument;
import com.innovacred.bpm.infrastructure.adapter.persistence.DocumentDefinitionRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.StoredDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFFormulaEvaluator;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentDefinitionRepository definitionRepository;
    private final StoredDocumentRepository storedDocumentRepository;
    private final String STORAGE_DIR = "C:/ProyectosJava/BMP/storage/";

    public DocumentDefinition saveDefinition(DocumentDefinition definition) {
        return definitionRepository.save(definition);
    }

    public String uploadTemplate(MultipartFile file) throws Exception {
        File directory = new File(STORAGE_DIR + "templates/");
        if (!directory.exists()) directory.mkdirs();

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(STORAGE_DIR + "templates/" + fileName);
        Files.copy(file.getInputStream(), filePath);

        return "storage/templates/" + fileName; // Return logical path
    }

    public StoredDocument uploadFile(MultipartFile file, String processInstanceId, Long definitionId, String user) throws Exception {
        File directory = new File(STORAGE_DIR);
        if (!directory.exists()) directory.mkdirs();

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(STORAGE_DIR + fileName);
        Files.copy(file.getInputStream(), filePath);

        StoredDocument doc = StoredDocument.builder()
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .storagePath(fileName)
                .processInstanceId(processInstanceId)
                .definitionId(definitionId)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(user)
                .build();

        return storedDocumentRepository.save(doc);
    }

    public List<StoredDocument> listByInstance(String instanceId) {
        return storedDocumentRepository.findByProcessInstanceId(instanceId);
    }

    public List<DocumentDefinition> listDefinitionsByProcess(String processKey) {
        if (processKey == null) {
            return definitionRepository.findAll();
        }
        return definitionRepository.findByProcessKey(processKey);
    }

    public DocumentDefinition getDefinitionByName(String name) {
        List<DocumentDefinition> defs = definitionRepository.findByNameContainingIgnoreCase(name);
        if (defs.isEmpty()) {
            throw new RuntimeException("No se encontró la plantilla con nombre que contenga: " + name);
        }
        
        for (DocumentDefinition def : defs) {
            if (def.getTemplatePath() != null && !def.getTemplatePath().isEmpty()) {
                return def;
            }
        }
        return defs.get(defs.size() - 1);
    }

    public String generateFromTemplate(String templateContent, Map<String, Object> data) {
        if (templateContent == null) return "";
        String result = templateContent;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String placeholder = "\\{\\{" + entry.getKey() + "\\}\\}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replaceAll(placeholder, value);
        }
        return result;
    }

    public StoredDocument generateAndStore(Long definitionId, String instanceId, Map<String, Object> variables, String user) throws Exception {
        DocumentDefinition def = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new RuntimeException("Definición no encontrada"));

        String content = generateFromTemplate(def.getTemplateContent(), variables);
        String fileName = "GENERATED_" + def.getName().replace(" ", "_") + "_" + UUID.randomUUID().toString().substring(0, 8) + ".html";
        
        File directory = new File(STORAGE_DIR);
        if (!directory.exists()) directory.mkdirs();

        Path filePath = Paths.get(STORAGE_DIR + fileName);
        Files.writeString(filePath, content);

        StoredDocument doc = StoredDocument.builder()
                .fileName(fileName)
                .contentType("text/html")
                .storagePath(fileName)
                .processInstanceId(instanceId)
                .definitionId(definitionId)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(user)
                .build();

        return storedDocumentRepository.save(doc);
    }

    public Map<String, String> generateFromOfficeTemplate(Long definitionId, String instanceId, Map<String, Object> variables, String user) throws Exception {
        DocumentDefinition def = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new RuntimeException("Definición no encontrada"));

        if (def.getTemplatePath() == null || def.getTemplatePath().isEmpty()) {
            throw new RuntimeException("La plantilla no tiene un archivo Office subido.");
        }

        // Leer mapeo de variables
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> tagMapping = mapper.readValue(def.getMappingJson(), new TypeReference<Map<String, String>>(){});

        Path templatePath = Paths.get("C:/ProyectosJava/BMP/" + def.getTemplatePath());
        if (!Files.exists(templatePath)) {
            String justFileName = Paths.get(def.getTemplatePath()).getFileName().toString();
            Path fallbackPath = Paths.get("C:/ProyectosJava/BMP/Documentacion/" + justFileName);
            if (Files.exists(fallbackPath)) {
                templatePath = fallbackPath;
            } else {
                throw new RuntimeException("Archivo de plantilla no encontrado: " + def.getTemplatePath());
            }
        }

        String fileName = def.getTemplatePath().toLowerCase();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        if (fileName.endsWith(".docx")) {
            try (FileInputStream fis = new FileInputStream(templatePath.toFile());
                 XWPFDocument document = new XWPFDocument(fis)) {
                 
                for (XWPFParagraph p : document.getParagraphs()) {
                    replaceInParagraph(p, tagMapping, variables);
                }
                
                for (XWPFTable tbl : document.getTables()) {
                    replaceInTable(tbl, tagMapping, variables);
                }
                
                document.write(outputStream);
            }
        } else if (fileName.endsWith(".xlsx")) {
            try (FileInputStream fis = new FileInputStream(templatePath.toFile());
                 XSSFWorkbook workbook = new XSSFWorkbook(fis)) {
                 
                for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                    XSSFSheet sheet = workbook.getSheetAt(i);
                    for (Row row : sheet) {
                        for (Cell cell : row) {
                            if (cell.getCellType() == CellType.STRING) {
                                String text = cell.getStringCellValue();
                                String newText = replaceTagsInText(text, tagMapping, variables);
                                if (!text.equals(newText)) {
                                    cell.setCellValue(newText);
                                }
                            }
                        }
                    }
                }
                
                XSSFFormulaEvaluator.evaluateAllFormulaCells(workbook);
                workbook.write(outputStream);
            }
        } else {
            throw new RuntimeException("Formato no soportado, debe ser .docx o .xlsx");
        }

        String ext = fileName.endsWith(".docx") ? ".docx" : ".xlsx";
        String outName = def.getName().replace(" ", "_") + ext;

        if ("PDF".equalsIgnoreCase(def.getExportFormat())) {
            try {
                Path tempIn = Files.createTempFile("doc_in_", ext);
                Files.write(tempIn, outputStream.toByteArray());
                
                Path outDir = tempIn.getParent();
                ProcessBuilder pb = new ProcessBuilder(
                        "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
                        "--headless",
                        "--convert-to", "pdf",
                        "--outdir", outDir.toString(),
                        tempIn.toString()
                );
                Process process = pb.start();
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    String pdfName = tempIn.getFileName().toString().replace(ext, ".pdf");
                    Path tempOut = outDir.resolve(pdfName);
                    if (Files.exists(tempOut)) {
                        byte[] pdfBytes = Files.readAllBytes(tempOut);
                        outputStream = new ByteArrayOutputStream();
                        outputStream.write(pdfBytes);
                        outName = def.getName().replace(" ", "_") + ".pdf";
                        Files.deleteIfExists(tempOut);
                    }
                } else {
                    throw new RuntimeException("Error en LibreOffice (Exit Code: " + exitCode + "). Verifique que LibreOffice está instalado.");
                }
                Files.deleteIfExists(tempIn);
            } catch (Exception e) {
                log.error("Error convirtiendo a PDF con LibreOffice", e);
                throw new RuntimeException("No se pudo convertir a PDF. Asegúrese de tener LibreOffice instalado en C:\\Program Files\\LibreOffice\\program\\soffice.exe", e);
            }
        }

        String base64 = Base64.getEncoder().encodeToString(outputStream.toByteArray());
        return Map.of("documentBase64", base64, "fileName", outName);
    }

    private void replaceInParagraph(XWPFParagraph p, Map<String, String> tagMapping, Map<String, Object> variables) {
        String text = p.getText();
        if (text == null || text.isEmpty()) return;
        
        String replacedText = replaceTagsInText(text, tagMapping, variables);
        if (!text.equals(replacedText)) {
            int runs = p.getRuns().size();
            for (int i = runs - 1; i >= 0; i--) {
                p.removeRun(i);
            }
            XWPFRun newRun = p.createRun();
            newRun.setText(replacedText);
        }
    }

    private void replaceInTable(XWPFTable tbl, Map<String, String> tagMapping, Map<String, Object> variables) {
        for (int i = 0; i < tbl.getRows().size(); i++) {
            XWPFTableRow row = tbl.getRows().get(i);
            
            // 1. Check if this row contains any grid tags (mapped key containing a dot)
            String gridVarKey = null;
            for (XWPFTableCell cell : row.getTableCells()) {
                for (XWPFParagraph p : cell.getParagraphs()) {
                    String text = p.getText();
                    if (text == null || text.isEmpty()) continue;
                    
                    for (Map.Entry<String, String> entry : tagMapping.entrySet()) {
                        String rawTag = entry.getKey().trim();
                        String tag = rawTag.startsWith("<") ? rawTag : "<" + rawTag + ">";
                        if (text.toLowerCase().contains(tag.toLowerCase())) {
                            String varKey = entry.getValue().trim();
                            if (varKey.contains(".")) {
                                gridVarKey = varKey.split("\\.")[0];
                                break;
                            }
                        }
                    }
                    if (gridVarKey != null) break;
                }
                if (gridVarKey != null) break;
            }
            
            if (gridVarKey != null) {
                log.info("Grid variable key detected: " + gridVarKey);
                Object gridValObj = variables.get(gridVarKey);
                if (gridValObj == null) {
                    // Try case-insensitive
                    for (Map.Entry<String, Object> vEntry : variables.entrySet()) {
                        if (vEntry.getKey().trim().equalsIgnoreCase(gridVarKey)) {
                            gridValObj = vEntry.getValue();
                            break;
                        }
                    }
                }
                log.info("Grid value found in variables: " + gridValObj);
                
                List<Map<String, Object>> gridData = null;
                if (gridValObj != null) {
                    try {
                        String json = gridValObj.toString();
                        ObjectMapper mapper = new ObjectMapper();
                        gridData = mapper.readValue(json, new TypeReference<List<Map<String, Object>>>(){});
                        log.info("Successfully parsed gridData size: " + gridData.size());
                        if (!gridData.isEmpty()) {
                            log.info("First item keys: " + gridData.get(0).keySet() + " values: " + gridData.get(0));
                        }
                    } catch (Exception e) {
                        log.error("Error parsing grid JSON for key " + gridVarKey, e);
                    }
                }
                
                if (gridData != null && !gridData.isEmpty()) {
                    int numRows = gridData.size();
                    // Duplicate i-th row (numRows - 1) times below it
                    for (int k = 1; k < numRows; k++) {
                        copyRow(tbl, row, i + k);
                    }
                    
                    // Fill each duplicated/original row with its corresponding item data
                    for (int k = 0; k < numRows; k++) {
                        XWPFTableRow currentRow = tbl.getRows().get(i + k);
                        Map<String, Object> itemData = gridData.get(k);
                        replaceInGridRow(currentRow, tagMapping, itemData, gridVarKey);
                    }
                    
                    // Skip the duplicated rows in the main loop
                    i += numRows - 1;
                } else {
                    // If no data is available, just remove the tags or replace them with empty strings
                    replaceInGridRow(row, tagMapping, Map.of(), gridVarKey);
                }
            } else {
                // Regular row, process paragraphs and nested tables
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        replaceInParagraph(p, tagMapping, variables);
                    }
                    for (XWPFTable nestedTbl : cell.getTables()) {
                        replaceInTable(nestedTbl, tagMapping, variables);
                    }
                }
            }
        }
    }

    private void copyRow(XWPFTable table, XWPFTableRow sourceRow, int insertAt) {
        XWPFTableRow newRow = table.insertNewTableRow(insertAt);
        newRow.getCtRow().setTrPr(sourceRow.getCtRow().getTrPr());
        
        for (XWPFTableCell sourceCell : sourceRow.getTableCells()) {
            XWPFTableCell newCell = newRow.createCell();
            newCell.getCTTc().setTcPr(sourceCell.getCTTc().getTcPr());
            
            // Clear default paragraph created by createCell()
            if (newCell.getParagraphs().size() > 0) {
                newCell.removeParagraph(0);
            }
            
            for (XWPFParagraph sourcePara : sourceCell.getParagraphs()) {
                XWPFParagraph newPara = newCell.addParagraph();
                newPara.getCTP().setPPr(sourcePara.getCTP().getPPr());
                
                for (XWPFRun sourceRun : sourcePara.getRuns()) {
                    XWPFRun newRun = newPara.createRun();
                    newRun.getCTR().setRPr(sourceRun.getCTR().getRPr());
                    
                    String runText = sourceRun.getText(0);
                    if (runText != null) {
                        newRun.setText(runText, 0);
                    }
                }
            }
        }
    }

    private void replaceInGridRow(XWPFTableRow row, Map<String, String> tagMapping, Map<String, Object> itemData, String gridVarKey) {
        for (XWPFTableCell cell : row.getTableCells()) {
            for (XWPFParagraph p : cell.getParagraphs()) {
                String text = p.getText();
                if (text == null || text.isEmpty()) continue;
                
                String replacedText = text;
                for (Map.Entry<String, String> entry : tagMapping.entrySet()) {
                    String rawTag = entry.getKey().trim();
                    String tag = rawTag.startsWith("<") ? rawTag : "<" + rawTag + ">";
                    String varKey = entry.getValue().trim();
                    
                    if (varKey.startsWith(gridVarKey + ".")) {
                        String colName = varKey.substring(gridVarKey.length() + 1);
                        Object valObj = itemData.get(colName);
                        
                        // Try case-insensitive lookup
                        if (valObj == null) {
                            for (Map.Entry<String, Object> itemEntry : itemData.entrySet()) {
                                if (itemEntry.getKey().trim().equalsIgnoreCase(colName)) {
                                    valObj = itemEntry.getValue();
                                    break;
                                }
                            }
                        }
                        
                        String val = valObj != null ? valObj.toString() : "";
                        log.info("Replacing tag in grid row: " + tag + " with value '" + val + "' (colName=" + colName + ")");
                        replacedText = replacedText.replaceAll("(?i)" + java.util.regex.Pattern.quote(tag), java.util.regex.Matcher.quoteReplacement(val));
                    }
                }
                
                if (!text.equals(replacedText)) {
                    int runs = p.getRuns().size();
                    for (int rIdx = runs - 1; rIdx >= 0; rIdx--) {
                        p.removeRun(rIdx);
                    }
                    XWPFRun newRun = p.createRun();
                    newRun.setText(replacedText);
                }
            }
        }
    }

    private String replaceTagsInText(String text, Map<String, String> tagMapping, Map<String, Object> variables) {
        // Remove zero-width spaces that Word sometimes inserts
        String result = text.replace("\u200B", "");
        
        for (Map.Entry<String, String> entry : tagMapping.entrySet()) {
            String rawTag = entry.getKey().trim(); 
            String varKey = entry.getValue().trim();
            
            String tag = rawTag;
            if (!tag.startsWith("<")) tag = "<" + tag + ">";
            
            if (varKey != null && !varKey.isEmpty()) {
                Object valObj = variables.get(varKey);
                // Try case-insensitive if not found
                if (valObj == null) {
                    for (Map.Entry<String, Object> vEntry : variables.entrySet()) {
                        if (vEntry.getKey().trim().equalsIgnoreCase(varKey)) {
                            valObj = vEntry.getValue();
                            break;
                        }
                    }
                }
                
                String val = valObj != null ? valObj.toString() : "";
                if (val.isEmpty()) {
                    val = "[Falta: " + varKey + "]";
                }
                
                // Case-insensitive replacement
                result = result.replaceAll("(?i)" + java.util.regex.Pattern.quote(tag), java.util.regex.Matcher.quoteReplacement(val));
            }
        }
        return result;
    }
}
