import org.apache.poi.xwpf.usermodel.*;
import java.io.FileInputStream;

public class TestExtract {
    public static void main(String[] args) throws Exception {
        String path = "C:/ProyectosJava/BMP/Documentacion/Modelo-pagare-final.docx";
        try (FileInputStream fis = new FileInputStream(path);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            for (XWPFParagraph p : document.getParagraphs()) {
                System.out.println("Main Body Para: [" + p.getText() + "]");
            }
            for (XWPFTable tbl : document.getTables()) {
                processTable(tbl);
            }
        }
    }
    
    private static void processTable(XWPFTable tbl) {
        for (XWPFTableRow row : tbl.getRows()) {
            for (XWPFTableCell cell : row.getTableCells()) {
                for (XWPFParagraph p : cell.getParagraphs()) {
                    String txt = p.getText();
                    if (txt != null && !txt.trim().isEmpty()) {
                        System.out.println("Cell Para: [" + txt + "]");
                    }
                }
                for (XWPFTable nested : cell.getTables()) {
                    System.out.println("--> Found nested table!");
                    processTable(nested);
                }
            }
        }
    }
}
