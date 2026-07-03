import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;

import java.io.FileInputStream;

public class TestPOI {
    public static void main(String[] args) throws Exception {
        String path = "C:/ProyectosJava/BMP/Documentacion/Modelo-pagare-final.docx";
        try (FileInputStream fis = new FileInputStream(path);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            System.out.println("Reading paragraphs:");
            for (XWPFParagraph p : document.getParagraphs()) {
                String text = p.getText();
                if (text.contains("USD")) {
                    System.out.println("Found paragraph: " + text);
                    System.out.print("Char by char for '<MONTOUSD>': ");
                    int idx = text.indexOf("<");
                    if (idx != -1) {
                        for (int i = idx; i < Math.min(text.length(), idx + 15); i++) {
                            char c = text.charAt(i);
                            System.out.print("[" + c + " : " + (int)c + "] ");
                        }
                    }
                    System.out.println();
                    
                    String replaced = text.replace("<MONTOUSD>", "[REPLACED]");
                    System.out.println("Replaced: " + replaced);
                }
            }
        }
    }
}
