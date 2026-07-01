package com.innovacred.bpm.application.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    private final TemplateEngine templateEngine;

    public String generatePdfFromHtml(String templateName, Map<String, Object> variables) {
        try {
            log.info("Generando PDF para plantilla: {}", templateName);
            
            // 1. Preparar el contexto de Thymeleaf
            Context context = new Context();
            context.setVariables(variables);
            
            // Si no hay fecha actual, inyectar una por defecto
            if (!variables.containsKey("fechaActual")) {
                context.setVariable("fechaActual", java.time.LocalDate.now().toString());
            }

            // 2. Procesar la plantilla HTML
            String processedHtml = templateEngine.process("pdf/" + templateName, context);

            // 3. Convertir HTML a PDF usando OpenHTMLToPDF
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.withHtmlContent(processedHtml, null);
                builder.toStream(outputStream);
                builder.run();

                // 4. Devolver como Base64
                byte[] pdfBytes = outputStream.toByteArray();
                return Base64.getEncoder().encodeToString(pdfBytes);
            }
        } catch (Exception e) {
            log.error("Error generando PDF para {}", templateName, e);
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        }
    }
}
