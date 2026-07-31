package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ParametricService;
import com.innovacred.bpm.domain.entity.ParametricTable;
import com.innovacred.bpm.infrastructure.adapter.persistence.ParametricTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicRestController {

    private final ParametricTableRepository tableRepository;
    private final ParametricService parametricService;

    @GetMapping("/brand")
    public ResponseEntity<Map<String, String>> getBrandInfo() {
        Map<String, String> response = new HashMap<>();
        
        // Valores por defecto
        response.put("brandName", "Hoptech");
        response.put("slogan", "SOLUCIONES TECNOLÓGICAS");
        response.put("logoPath", "logo-InnovaConsulting-azul.png");
        response.put("primaryColor", "#512a7b");
        response.put("secondaryColor", "#2c387e");
        response.put("accentColor", "#D4AF37");

        try {
            // Buscar la tabla de parametros generales
            List<ParametricTable> tables = tableRepository.findAll();
            ParametricTable table = tables.stream()
                .filter(t -> 
                    (t.getLabel() != null && t.getLabel().toLowerCase().contains("parametros generales")) || 
                    (t.getName() != null && t.getName().toLowerCase().contains("parametros_generales")) ||
                    (t.getName() != null && t.getName().toLowerCase().contains("parametros generales")) ||
                    (t.getName() != null && t.getName().toLowerCase().contains("paranmetros_generales"))
                )
                .findFirst()
                .orElse(null);

            if (table != null) {
                List<Map<String, Object>> data = parametricService.listData(table.getId());
                
                for (Map<String, Object> row : data) {
                    String desc = getMapValueCaseInsensitive(row, "descripcion");
                    String val = getMapValueCaseInsensitive(row, "valor");
                    
                    if (desc != null && val != null && !val.trim().isEmpty()) {
                        String cleanDesc = desc.toLowerCase().trim();
                        if (cleanDesc.equals("color_primario")) {
                            response.put("primaryColor", val);
                        } else if (cleanDesc.equals("color_secundario")) {
                            response.put("secondaryColor", val);
                        } else if (cleanDesc.equals("color_acento")) {
                            response.put("accentColor", val);
                        } else if (cleanDesc.equals("ruta_logo") || cleanDesc.equals("ruta logo")) {
                            response.put("logoPath", val);
                        } else if (cleanDesc.equals("nombre_marca") || cleanDesc.equals("nombre marca")) {
                            response.put("brandName", val);
                        } else if (cleanDesc.equals("slogan_marca") || cleanDesc.equals("slogan marca")) {
                            response.put("slogan", val);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Si hay un error, se entregan los valores por defecto sin romper la petición
        }

        return ResponseEntity.ok(response);
    }

    private String getMapValueCaseInsensitive(Map<String, Object> map, String targetKey) {
        if (map == null || targetKey == null) return null;
        for (String key : map.keySet()) {
            if (key.equalsIgnoreCase(targetKey)) {
                Object val = map.get(key);
                return val != null ? val.toString() : null;
            }
        }
        return null;
    }
}
