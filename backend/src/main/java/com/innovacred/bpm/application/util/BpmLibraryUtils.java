package com.innovacred.bpm.application.util;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.text.NumberFormat;
import java.util.Locale;

@Component("bpmUtils")
public class BpmLibraryUtils {

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
        DateTimeFormatter.ISO_LOCAL_DATE,
        DateTimeFormatter.ofPattern("d/M/yyyy"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd")
    };

    private LocalDate parseLocalDate(Object dateObj) {
        if (dateObj == null) {
            return null;
        }
        if (dateObj instanceof LocalDate) {
            return (LocalDate) dateObj;
        }
        if (dateObj instanceof java.util.Date) {
            return new java.sql.Date(((java.util.Date) dateObj).getTime()).toLocalDate();
        }
        String dateStr = dateObj.toString().trim();
        // Remove time part if exists (e.g., 2026-07-07T12:00:00 or 7/7/2026, 11:25:11 a.m.)
        if (dateStr.contains(" ")) {
            dateStr = dateStr.split(" ")[0];
        }
        if (dateStr.contains(",")) {
            dateStr = dateStr.split(",")[0];
        }
        if (dateStr.contains("T")) {
            dateStr = dateStr.split("T")[0];
        }
        
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception ignored) {}
        }
        
        throw new IllegalArgumentException("Formato de fecha no soportado: " + dateObj);
    }

    /**
     * Valida si una fecha cae en sábado o domingo.
     */
    public boolean esFinSemana(Object fecha) {
        try {
            LocalDate localDate = parseLocalDate(fecha);
            if (localDate == null) return false;
            int dayOfWeek = localDate.getDayOfWeek().getValue();
            return dayOfWeek == 6 || dayOfWeek == 7; // 6 = Saturday, 7 = Sunday
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Calcula la edad en base a la fecha de nacimiento.
     */
    public int calcularEdad(Object fechaNacimiento) {
        try {
            LocalDate birthDate = parseLocalDate(fechaNacimiento);
            if (birthDate == null) return 0;
            return Period.between(birthDate, LocalDate.now()).getYears();
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Valida una cédula de identidad ecuatoriana utilizando el algoritmo de módulo 10.
     */
    public boolean validarCedulaEcuatoriana(String cedula) {
        if (cedula == null) return false;
        cedula = cedula.trim();
        if (cedula.length() != 10) return false;

        try {
            int provincia = Integer.parseInt(cedula.substring(0, 2));
            if (provincia < 1 || provincia > 24) return false;

            int tercerDigito = Integer.parseInt(cedula.substring(2, 3));
            if (tercerDigito < 0 || tercerDigito > 6) return false;

            int sum = 0;
            int[] coeficientes = {2, 1, 2, 1, 2, 1, 2, 1, 2};
            for (int i = 0; i < 9; i++) {
                int valor = Integer.parseInt(cedula.substring(i, i + 1)) * coeficientes[i];
                if (valor >= 10) {
                    valor -= 9;
                }
                sum += valor;
            }

            int digitoVerificador = Integer.parseInt(cedula.substring(9, 10));
            int residuo = sum % 10;
            int resultado = (residuo == 0) ? 0 : 10 - residuo;

            return resultado == digitoVerificador;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Formatea un número como moneda local (ej: $ 1.250,50).
     */
    public String formatearMoneda(Object monto) {
        if (monto == null) return "$ 0,00";
        try {
            double valor;
            if (monto instanceof Number) {
                valor = ((Number) monto).doubleValue();
            } else {
                valor = Double.parseDouble(monto.toString());
            }
            NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("es", "EC"));
            return formatter.format(valor);
        } catch (Exception e) {
            return "$ 0,00";
        }
    }
}
