package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.ScreenDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ScreenDefinitionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScreenSeeder implements CommandLineRunner {

    private final ScreenDefinitionRepository repository;

    public ScreenSeeder(ScreenDefinitionRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedScreenIfNotExists("flujo_credito", "Simulación", getSimulacionLayout());
        seedScreenIfNotExists("flujo_credito", "Registro de Cliente", getGenericLayout("Registro de Cliente", "Datos Personales", "Nombres", "Apellidos", "Identificación"));
        seedScreenIfNotExists("flujo_credito", "Análisis", getGenericLayout("Análisis", "Revisión de Analista", "Observaciones", "Decisión", "Monto Aprobado"));
        seedScreenIfNotExists("flujo_credito", "Constitución de Garantía", getGenericLayout("Constitución de Garantía", "Datos Legales", "Tipo Garantía", "Notaría", "Fecha Registro"));
        seedScreenIfNotExists("flujo_credito", "Instrumentación y Desembolso", getGenericLayout("Instrumentación y Desembolso", "Desembolso", "Cuenta Destino", "Monto a Transferir", "Confirmación"));
    }

    private void seedScreenIfNotExists(String processKey, String taskKey, String layoutJson) {
        List<ScreenDefinition> existing = repository.findAll();
        ScreenDefinition screen = existing.stream().filter(s -> 
            processKey.equals(s.getProcessKey()) && taskKey.equals(s.getTaskKey())
        ).findFirst().orElse(null);

        if (screen == null) {
            screen = ScreenDefinition.builder()
                    .name("Pantalla " + taskKey)
                    .processKey(processKey)
                    .taskKey(taskKey)
                    .layoutJson(layoutJson)
                    .isDefault(true)
                    .build();
            repository.save(screen);
        }
    }

    private String getSimulacionLayout() {
        return "{\n" +
               "  \"tabs\": [\n" +
               "    {\n" +
               "      \"label\": \"Datos Cliente\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"SIMULACION\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"interviniente_tipo_identificacion\", \"label\": \"Tipo de Identificacion\", \"controlType\": \"COMBO\", \"required\": true, \"config\": { \"options\": [{\"id\":\"CEDULA\",\"label\":\"Cédula\"},{\"id\":\"RUC\",\"label\":\"RUC\"},{\"id\":\"PASAPORTE\",\"label\":\"Pasaporte\"}] } },\n" +
               "            { \"name\": \"interviniente_int_identificacion\", \"label\": \"Identificación\", \"controlType\": \"TEXTBOX\", \"required\": true },\n" +
               "            { \"name\": \"boton_1\", \"label\": \"Consultor\", \"controlType\": \"BUTTON\", \"required\": true, \"config\": { \"buttonAction\": \"CUSTOM\", \"apiToExecute\": \"APICLI\", \"buttonLabel\": \"Consultor\", \"buttonIcon\": \"bi-play-circle\" } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"Datos solicitante\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"interviniente_int_nombres_completos\", \"label\": \"Nombres Completos\", \"controlType\": \"TEXTBOX\" },\n" +
               "            { \"name\": \"interviniente_int_estado_civil\", \"label\": \"Estado Civil\", \"controlType\": \"COMBO\", \"config\": { \"options\": [{\"id\":\"SOLTERO\",\"label\":\"Soltero\"},{\"id\":\"CASADO\",\"label\":\"Casado\"}] } },\n" +
               "            { \"name\": \"interviniente_int_separacion_bienes\", \"label\": \"Separacion de bienes\", \"controlType\": \"YESNO\", \"visibleIf\": \"interviniente_int_estado_civil === 'CASADO'\" },\n" +
               "            { \"name\": \"tieneCodeudor\", \"label\": \"¿Tiene Codeudor?\", \"controlType\": \"YESNO\" },\n" +
               "            { \"name\": \"estadoCivilCodeudor\", \"label\": \"Estado Civil Codeudor\", \"controlType\": \"COMBO\", \"visibleIf\": \"tieneCodeudor === true\", \"config\": { \"options\": [{\"id\":\"SOLTERO\",\"label\":\"Soltero\"},{\"id\":\"CASADO\",\"label\":\"Casado\"}] } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"Producto\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"tipo_credito_descripcion\", \"label\": \"Tipo de Crédito\", \"controlType\": \"COMBO\", \"required\": true, \"config\": { \"options\": [{\"id\":\"CONSUMO\",\"label\":\"Consumo\"},{\"id\":\"HIPOTECARIO\",\"label\":\"Hipotecario\"}] } },\n" +
               "            { \"name\": \"producto_credito_descripcion\", \"label\": \"Producto de crédito\", \"controlType\": \"COMBO\", \"config\": { \"options\": [{\"id\":\"PROD1\",\"label\":\"Producto 1\",\"tasa\":\"16\",\"plazo_minimo\":\"12\",\"plazo_maximo\":\"48\",\"monto_minimo\":\"1000\",\"monto_maximo\":\"50000\"}] } },\n" +
               "            { \"name\": \"producto_credito_pro_cre_tasa\", \"label\": \"Tasa\", \"controlType\": \"COMBO\", \"config\": { \"options\": [{\"id\":\"16\",\"label\":\"16%\"}] } },\n" +
               "            { \"name\": \"producto_credito_pro_cre_plazo_minimo\", \"label\": \"Plazo minimo\", \"controlType\": \"COMBO\" },\n" +
               "            { \"name\": \"producto_credito_pro_cre_plazo_maximo\", \"label\": \"Plaza máximo\", \"controlType\": \"COMBO\" },\n" +
               "            { \"name\": \"producto_credito_pro_cre_monto_minimo\", \"label\": \"Monto minimo\", \"controlType\": \"COMBO\" },\n" +
               "            { \"name\": \"producto_credito_pro_cre_monto_maximo\", \"label\": \"Monto máximo\", \"controlType\": \"COMBO\" }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    },\n" +
               "    {\n" +
               "      \"label\": \"Ingresos / Egresos\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"Ingresos\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"gridIngresos\", \"label\": \"Ingresos\", \"controlType\": \"GRID\", \"config\": { \"selectedColumns\": [ { \"name\": \"tipoInterviniente\", \"label\": \"Tipo Interviniente\", \"type\": \"TEXT\" }, { \"name\": \"mes\", \"label\": \"Mes\", \"type\": \"TEXT\" }, { \"name\": \"valor\", \"label\": \"Valor\", \"type\": \"NUMBER\" } ] } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"Egresos\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"gridEgresos\", \"label\": \"Egresos\", \"controlType\": \"GRID\", \"config\": { \"selectedColumns\": [ { \"name\": \"tipoInterviniente\", \"label\": \"Tipo Interviniente\", \"type\": \"TEXT\" }, { \"name\": \"concepto\", \"label\": \"Concepto (Vivienda, Transporte, etc.)\", \"type\": \"TEXT\" }, { \"name\": \"valor\", \"label\": \"Valor\", \"type\": \"NUMBER\" } ] } }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    },\n" +
               "    {\n" +
               "      \"label\": \"Resultado de Simulación\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"Propuesta Sugerida\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"montoSugerido\", \"label\": \"Monto Máximo Sugerido\", \"controlType\": \"TEXT\", \"config\": { \"readonly\": true, \"defaultValue\": \"Calculando...\" } },\n" +
               "            { \"name\": \"cuotaSugerida\", \"label\": \"Cuota Estimada Mensual\", \"controlType\": \"TEXT\", \"config\": { \"readonly\": true, \"defaultValue\": \"Calculando...\" } },\n" +
               "            { \"name\": \"plazoSugerido\", \"label\": \"Plazo Recomendado\", \"controlType\": \"TEXT\", \"config\": { \"readonly\": true, \"defaultValue\": \"Calculando...\" } }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }

    private String getGenericLayout(String tabLabel, String sectionTitle, String f1, String f2, String f3) {
        return "{\n" +
               "  \"tabs\": [\n" +
               "    {\n" +
               "      \"label\": \"" + tabLabel + "\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"" + sectionTitle + "\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"f1\", \"label\": \"" + f1 + "\", \"controlType\": \"TEXT\", \"required\": true },\n" +
               "            { \"name\": \"f2\", \"label\": \"" + f2 + "\", \"controlType\": \"TEXT\" },\n" +
               "            { \"name\": \"f3\", \"label\": \"" + f3 + "\", \"controlType\": \"TEXT\" }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
