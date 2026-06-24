package com.innovacred.bpm.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ScoringRuleService {

    /**
     * Evalúa el riesgo crediticio basado en variables financieras.
     * Si existiera Flowable DMN desplegado, este servicio invocaría al DmnRuleService.
     * Por ahora, emulamos un motor de reglas de negocio en Java puro.
     */
    public Map<String, Object> evaluateScoring(Map<String, Object> variables) {
        log.info("Evaluando reglas de Scoring con variables: {}", variables);
        
        try {
            double ingresos = parseDouble(variables.get("ingresos"));
            double deudas = parseDouble(variables.get("deudas"));
            double monto = parseDouble(variables.get("monto"));
            int plazo = parseInt(variables.get("plazo")); // meses
            double tasa = parseDouble(variables.get("tasa")) / 100.0;
            
            // Si falta algún dato vital
            if (ingresos <= 0 || plazo <= 0 || monto <= 0) {
                return buildResult("RECHAZADO", "Datos insuficientes o inválidos para evaluación.");
            }

            // Cálculo básico de cuota mensual (fórmula de amortización francesa simplificada)
            double cuotaMensual;
            if (tasa > 0) {
                double tasaMensual = tasa / 12.0;
                cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);
            } else {
                cuotaMensual = monto / plazo;
            }

            // Debt-to-Income (DTI) Ratio: Qué porcentaje de mis ingresos se van en deudas
            double dti = ((deudas + cuotaMensual) / ingresos) * 100.0;
            
            log.info("DTI Calculado: {}%", String.format("%.2f", dti));

            Map<String, Object> result = new HashMap<>();
            result.put("cuotaMensual", cuotaMensual);
            result.put("dti", dti);

            // REGLAS DEL MOTOR
            if (dti > 50.0) {
                result.putAll(buildResult("RECHAZADO", "Ratio de endeudamiento (DTI) demasiado alto (> 50%)."));
            } else if (dti > 35.0) {
                result.putAll(buildResult("PRE_APROBADO", "Ratio de endeudamiento medio. Requiere revisión manual o garantías."));
            } else {
                result.putAll(buildResult("APROBADO", "Aprobación automática. Cliente con buena capacidad de pago."));
            }

            return result;
        } catch (Exception e) {
            log.error("Error al evaluar scoring", e);
            return buildResult("ERROR", "Ocurrió un error al procesar las reglas: " + e.getMessage());
        }
    }

    private Map<String, Object> buildResult(String decision, String justificacion) {
        Map<String, Object> r = new HashMap<>();
        r.put("decision", decision);
        r.put("justificacion", justificacion);
        return r;
    }

    private double parseDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); } catch (Exception e) { return 0.0; }
    }

    private int parseInt(Object obj) {
        if (obj == null) return 0;
        if (obj instanceof Number) return ((Number) obj).intValue();
        try { return Integer.parseInt(obj.toString()); } catch (Exception e) { return 0; }
    }
}
