package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.application.service.ParametricService;
import com.innovacred.bpm.domain.entity.ParametricColumn;
import com.innovacred.bpm.domain.entity.ParametricTable;
import com.innovacred.bpm.domain.entity.ScreenDefinition;
import com.innovacred.bpm.infrastructure.adapter.persistence.ParametricTableRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.ScreenDefinitionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class ScreenSeeder implements CommandLineRunner {

    private final ScreenDefinitionRepository repository;
    private final ParametricTableRepository parametricTableRepository;
    private final ParametricService parametricService;

    public ScreenSeeder(ScreenDefinitionRepository repository,
                        ParametricTableRepository parametricTableRepository,
                        ParametricService parametricService) {
        this.repository = repository;
        this.parametricTableRepository = parametricTableRepository;
        this.parametricService = parametricService;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) throws Exception {
        seedScreenIfNotExists("flujo_credito", "Simulación", getSimulacionLayout());
        seedScreenIfNotExists("flujo_credito", "Registro de Cliente", getGenericLayout("Registro de Cliente", "Datos Personales", "Nombres", "Apellidos", "Identificación"));
        seedScreenIfNotExists("flujo_credito", "Análisis", getGenericLayout("Análisis", "Revisión de Analista", "Observaciones", "Decisión", "Monto Aprobado"));
        seedScreenIfNotExists("flujo_credito", "Constitución de Garantía", getGenericLayout("Constitución de Garantía", "Datos Legales", "Tipo Garantía", "Notaría", "Fecha Registro"));
        seedScreenIfNotExists("flujo_credito", "Instrumentación y Desembolso", getGenericLayout("Instrumentación y Desembolso", "Desembolso", "Cuenta Destino", "Monto a Transferir", "Confirmación"));

        seedScreenIfNotExists("flujo_gestion_turnos", "1. En Espera de Llamado en Sala", getGenericLayout("Espera en Sala", "Datos del Turno", "codigoTurno", "servicio", "nombreCliente"));
        seedScreenIfNotExists("flujo_gestion_turnos", "2. Atender Cliente en Ventanilla", getGenericLayout("Atención en Ventanilla", "Gestión de Atención", "codigoTurno", "nombreCliente", "observaciones"));

        // 1. Sembrar Tablas Paramétricas
        Long canalTableId = seedCanalNotificacionParametric();
        Long edadTableId = seedFiltroEdadParametric();
        Long calificacionTableId = seedFiltroCalificacionParametric();
        Long estadoPagosTableId = seedFiltroEstadoPagosParametric();
        Long agenciaTableId = seedFiltroAgenciaParametric();
        Long camposClienteTableId = seedCamposClienteParametric();
        Long operadoresTableId = seedOperadoresLogicosParametric();
        Long tipoEncabezadoTableId = seedTipoEncabezadoParametric();
        Long tipoBotonTableId = seedTipoBotonParametric();

        // 2. Pantallas para Mensajería Automática de Campañas vinculadas a las Paramétricas
        String disenarLayout = getDisenarCampanaLayout(canalTableId, edadTableId, calificacionTableId, estadoPagosTableId, agenciaTableId, camposClienteTableId, operadoresTableId, tipoEncabezadoTableId, tipoBotonTableId);
        seedScreenIfNotExists("mensajeria_automatica", "Task_DisenarCampana", disenarLayout);
        seedScreenIfNotExists("mensajeria_automatica", "1. Diseñar Notificación y Definir Filtros", disenarLayout);
        seedScreenIfNotExists("mensajeria_automatica_de_campanas", "Task_DisenarCampana", disenarLayout);
        seedScreenIfNotExists("mensajeria_automatica_de_campanas", "1. Diseñar Notificación y Definir Filtros", disenarLayout);

        String previewLayout = getValidarPreviewLayout();
        seedScreenIfNotExists("mensajeria_automatica", "Task_ValidarPreview", previewLayout);
        seedScreenIfNotExists("mensajeria_automatica", "3. Validar Preview y Confirmar Envío", previewLayout);
        seedScreenIfNotExists("mensajeria_automatica_de_campanas", "Task_ValidarPreview", previewLayout);
        seedScreenIfNotExists("mensajeria_automatica_de_campanas", "3. Validar Preview y Confirmar Envío", previewLayout);

        String resultadosLayout = getRevisarResultadosLayout();
        seedScreenIfNotExists("mensajeria_automatica", "Task_RevisarResultados", resultadosLayout);
        seedScreenIfNotExists("mensajeria_automatica", "6. Revisar Resultados y Cerrar Campaña", resultadosLayout);
        seedScreenIfNotExists("mensajeria_automatica_de_campanas", "Task_RevisarResultados", resultadosLayout);
        seedScreenIfNotExists("mensajeria_automatica_de_campanas", "6. Revisar Resultados y Cerrar Campaña", resultadosLayout);
    }

    private Long seedCanalNotificacionParametric() {
        ParametricTable canalTable = parametricTableRepository.findAll().stream()
                .filter(t -> "CANAL_NOTIFICACION".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (canalTable == null) {
            log.info("Creando tabla paramétrica CANAL_NOTIFICACION...");
            ParametricTable t = new ParametricTable();
            t.setName("CANAL_NOTIFICACION");
            t.setLabel("Canales de Notificación");
            t.setDescription("Catálogo paramétrico de canales para envío de campañas de mensajería");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            canalTable = parametricService.saveTable(t);
            parametricService.insertData(canalTable.getId(), Map.of("codigo", "EMAIL", "descripcion", "Correo Electrónico", "activo", true));
            parametricService.insertData(canalTable.getId(), Map.of("codigo", "SMS", "descripcion", "Mensaje SMS", "activo", true));
            parametricService.insertData(canalTable.getId(), Map.of("codigo", "WHATSAPP", "descripcion", "WhatsApp Business", "activo", true));
            parametricService.insertData(canalTable.getId(), Map.of("codigo", "PORTAL", "descripcion", "Notificación Portal Web", "activo", true));
            parametricService.insertData(canalTable.getId(), Map.of("codigo", "MULTICANAL", "descripcion", "Omnicanal (Email + Portal)", "activo", true));
            log.info("Tabla paramétrica CANAL_NOTIFICACION registrada exitosamente con ID: {}", canalTable.getId());
        }

        return canalTable.getId();
    }

    private Long seedFiltroEdadParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "FILTRO_EDAD".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica FILTRO_EDAD...");
            ParametricTable t = new ParametricTable();
            t.setName("FILTRO_EDAD");
            t.setLabel("Filtros de Rango de Edad");
            t.setDescription("Catálogo paramétrico de rangos de edad para segmentación de clientes");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "MAYOR_18", "descripcion", "Clientes Mayores de 18 Años", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "MAYOR_25", "descripcion", "Clientes Mayores de 25 Años", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "TERCERA_EDAD", "descripcion", "Clientes de Tercera Edad (65+)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "TODOS", "descripcion", "Todos los Rangos de Edad", "activo", true));
        }
        return table.getId();
    }

    private Long seedFiltroCalificacionParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "FILTRO_CALIFICACION".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica FILTRO_CALIFICACION...");
            ParametricTable t = new ParametricTable();
            t.setName("FILTRO_CALIFICACION");
            t.setLabel("Filtros de Calificación Crediticia");
            t.setDescription("Catálogo paramétrico de calificaciones de riesgo crediticio");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "AAA", "descripcion", "Calificación AAA (Excelente)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "AA", "descripcion", "Calificación AA", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "A", "descripcion", "Calificación A", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "B", "descripcion", "Calificación B", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "C", "descripcion", "Calificación C", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "TODAS", "descripcion", "Todas las Calificaciones", "activo", true));
        }
        return table.getId();
    }

    private Long seedFiltroEstadoPagosParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "FILTRO_ESTADO_PAGOS".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica FILTRO_ESTADO_PAGOS...");
            ParametricTable t = new ParametricTable();
            t.setName("FILTRO_ESTADO_PAGOS");
            t.setLabel("Filtros de Estado de Pagos / Morosidad");
            t.setDescription("Catálogo paramétrico de cumplimiento de pagos para segmentación");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "AL_DIA", "descripcion", "Clientes Al Día (Sin Retraso en sus Pagos)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "CON_RETRASO", "descripcion", "Clientes Con Retraso en sus Pagos", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "CON_PROBLEMA_PAGOS", "descripcion", "Clientes Con Problemas en sus Pagos (Cobranza)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "TODOS", "descripcion", "Todos los Estados de Pago", "activo", true));
        }
        return table.getId();
    }

    private Long seedFiltroAgenciaParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "FILTRO_AGENCIA".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica FILTRO_AGENCIA...");
            ParametricTable t = new ParametricTable();
            t.setName("FILTRO_AGENCIA");
            t.setLabel("Filtros de Agencias y Sucursales");
            t.setDescription("Catálogo paramétrico de agencias operativas para segmentación");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "TODAS", "descripcion", "Todas las Agencias", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "QUITO", "descripcion", "Agencia Quito", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "GUAYAQUIL", "descripcion", "Agencia Guayaquil", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "CUENCA", "descripcion", "Agencia Cuenca", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "AMBATO", "descripcion", "Agencia Ambato", "activo", true));
        }
        return table.getId();
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
        } else {
            screen.setLayoutJson(layoutJson);
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

    private Long seedCamposClienteParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "CAMPOS_CLIENTE".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica CAMPOS_CLIENTE...");
            ParametricTable t = new ParametricTable();
            t.setName("CAMPOS_CLIENTE");
            t.setLabel("Atributos del Cliente para Filtros");
            t.setDescription("Catálogo paramétrico de atributos de clientes disponibles para el motor dinámico de segmentación");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "edad", "descripcion", "Edad del Cliente", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "calificacion", "descripcion", "Calificación Crediticia / Riesgo", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "morosidad", "descripcion", "Estado de Pagos / Días Atraso", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "agencia", "descripcion", "Agencia / Sucursal", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "saldo_promedio", "descripcion", "Saldo Promedio en Cuenta", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "tipo_cliente", "descripcion", "Tipo de Cliente (Persona/Empresa)", "activo", true));
        }
        return table.getId();
    }

    private Long seedOperadoresLogicosParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "OPERADORES_LOGICOS".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica OPERADORES_LOGICOS...");
            ParametricTable t = new ParametricTable();
            t.setName("OPERADORES_LOGICOS");
            t.setLabel("Operadores Lógicos de Comparación");
            t.setDescription("Catálogo paramétrico de operadores lógicos para reglas dinámicas");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "EQ", "descripcion", "Es Igual a (=)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "GTE", "descripcion", "Mayor o Igual a (>=)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "LTE", "descripcion", "Menor o Igual a (<=)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "IN", "descripcion", "En Lista (Contenido en)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "CONTAINS", "descripcion", "Contiene Texto", "activo", true));
        }
        return table.getId();
    }

    private Long seedTipoEncabezadoParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "TIPO_ENCABEZADO".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica TIPO_ENCABEZADO...");
            ParametricTable t = new ParametricTable();
            t.setName("TIPO_ENCABEZADO");
            t.setLabel("Tipos de Encabezado Multimedia");
            t.setDescription("Catálogo paramétrico de tipos de encabezado para notificaciones ricas");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "NINGUNO", "descripcion", "Solo Texto (Sin Multimedia)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "IMAGEN", "descripcion", "Imagen Banner (.png, .jpg)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "VIDEO", "descripcion", "Video Corto Promo (.mp4)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "DOCUMENTO", "descripcion", "Documento PDF / Archivo (.pdf)", "activo", true));
        }
        return table.getId();
    }

    private Long seedTipoBotonParametric() {
        ParametricTable table = parametricTableRepository.findAll().stream()
                .filter(t -> "TIPO_BOTON".equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElse(null);

        if (table == null) {
            log.info("Creando tabla paramétrica TIPO_BOTON...");
            ParametricTable t = new ParametricTable();
            t.setName("TIPO_BOTON");
            t.setLabel("Tipos de Botones Interactivos CTA");
            t.setDescription("Catálogo paramétrico de botones de llamado a la acción para notificaciones");
            t.setColumns(List.of(
                    ParametricColumn.builder().name("codigo").label("Código").type("string").build(),
                    ParametricColumn.builder().name("descripcion").label("Descripción").type("string").build(),
                    ParametricColumn.builder().name("activo").label("Activo").type("boolean").build()
            ));

            table = parametricService.saveTable(t);
            parametricService.insertData(table.getId(), Map.of("codigo", "URL", "descripcion", "Enlace Web (URL)", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "PHONE", "descripcion", "Llamada Telefónica Directa", "activo", true));
            parametricService.insertData(table.getId(), Map.of("codigo", "QUICK_REPLY", "descripcion", "Respuesta Rápida / Acción", "activo", true));
        }
        return table.getId();
    }

    private String getDisenarCampanaLayout(Long canalTableId, Long edadTableId, Long calificacionTableId, Long estadoPagosTableId, Long agenciaTableId, Long camposClienteTableId, Long operadoresTableId, Long tipoEncabezadoTableId, Long tipoBotonTableId) {
        return "{\n" +
               "  \"tabs\": [\n" +
               "    {\n" +
               "      \"label\": \"Diseño de Notificación Rica y Filtros de Segmentación\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"1. Datos Generales de la Campaña\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"nombreCampana\", \"label\": \"Nombre de la Campaña\", \"controlType\": \"TEXTBOX\", \"required\": true },\n" +
               "            { \"name\": \"canalEnvio\", \"label\": \"Canal Principal\", \"controlType\": \"COMBO\", \"required\": true, \"config\": { \"dataSourceEntityId\": " + canalTableId + ", \"valueField\": \"codigo\", \"displayField\": \"descripcion\" } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"2. Encabezado Multimedia (Opcional - Imagen / Video / PDF)\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"tipoEncabezado\", \"label\": \"Tipo de Encabezado\", \"controlType\": \"COMBO\", \"config\": { \"dataSourceEntityId\": " + tipoEncabezadoTableId + ", \"valueField\": \"codigo\", \"displayField\": \"descripcion\" } },\n" +
               "            { \"name\": \"urlHeaderMedia\", \"label\": \"Archivo Multimedia Adjunto (Imagen / Video / PDF)\", \"controlType\": \"FILEUPLOAD\", \"visibleIf\": \"tipoEncabezado !== 'NINGUNO'\" }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"3. Mensaje Principal y Pie de Página\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"asunto\", \"label\": \"Asunto / Título Notificación\", \"controlType\": \"TEXTBOX\", \"required\": true },\n" +
               "            { \"name\": \"cuerpoMensaje\", \"label\": \"Mensaje (Soporta variables ${nombre}, ${producto}, ${guia}, ${monto}, ${fecha}, ${link})\", \"controlType\": \"TEXTAREA\", \"required\": true },\n" +
               "            { \"name\": \"piePagina\", \"label\": \"Pie de Página / Texto de Seguridad (Opcional)\", \"controlType\": \"TEXTAREA\" }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"4. Botonera Interactiva (Llamado a la Acción / CTA)\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"gridBotonesInteractivos\", \"label\": \"Botones Interactivos Agregados\", \"controlType\": \"GRID\", \"config\": { \"selectedColumns\": [ { \"name\": \"tipoBoton\", \"label\": \"Tipo Botón\", \"type\": \"COMBO\", \"parametricTableId\": " + tipoBotonTableId + " }, { \"name\": \"etiquetaBoton\", \"label\": \"Texto en Botón (ej. Acéptala aquí)\", \"type\": \"TEXT\" }, { \"name\": \"valorBoton\", \"label\": \"URL / Teléfono / Respuesta\", \"type\": \"TEXT\" } ] } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"5. Filtros Estándar de Segmentación (APICLI)\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"filtroEdad\", \"label\": \"Rango de Edad\", \"controlType\": \"COMBO\", \"config\": { \"dataSourceEntityId\": " + edadTableId + ", \"valueField\": \"codigo\", \"displayField\": \"descripcion\" } },\n" +
               "            { \"name\": \"filtroCalificacion\", \"label\": \"Calificación Crediticia / Riesgo\", \"controlType\": \"COMBO\", \"config\": { \"dataSourceEntityId\": " + calificacionTableId + ", \"valueField\": \"codigo\", \"displayField\": \"descripcion\" } },\n" +
               "            { \"name\": \"filtroEstadoPagos\", \"label\": \"Estado de Cumplimiento de Pagos\", \"controlType\": \"COMBO\", \"config\": { \"dataSourceEntityId\": " + estadoPagosTableId + ", \"valueField\": \"codigo\", \"displayField\": \"descripcion\" } },\n" +
               "            { \"name\": \"filtroAgencia\", \"label\": \"Agencia / Sucursal\", \"controlType\": \"COMBO\", \"config\": { \"dataSourceEntityId\": " + agenciaTableId + ", \"valueField\": \"codigo\", \"displayField\": \"descripcion\" } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"6. Constructor Dinámico de Criterios Adicionales\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"gridCriteriosSegmentacion\", \"label\": \"Criterios de Selección Personalizados\", \"controlType\": \"GRID\", \"config\": { \"selectedColumns\": [ { \"name\": \"campoAtributo\", \"label\": \"Atributo del Cliente\", \"type\": \"COMBO\", \"parametricTableId\": " + camposClienteTableId + " }, { \"name\": \"operadorLogico\", \"label\": \"Operador de Comparación\", \"type\": \"COMBO\", \"parametricTableId\": " + operadoresTableId + " }, { \"name\": \"valorFiltro\", \"label\": \"Valor del Criterio\", \"type\": \"TEXT\" } ] } }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }

    private String getValidarPreviewLayout() {
        return "{\n" +
               "  \"tabs\": [\n" +
               "    {\n" +
               "      \"label\": \"Resumen, Preview de Notificación y Aprobación\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"Detalles de Notificación Configurada\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"nombreCampana\", \"label\": \"Nombre de la Campaña\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"canalEnvio\", \"label\": \"Canal de Envío\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"asunto\", \"label\": \"Asunto / Título\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"cuerpoMensaje\", \"label\": \"Cuerpo del Mensaje (Plantilla)\", \"controlType\": \"TEXTAREA\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"piePagina\", \"label\": \"Pie de Página / Legales\", \"controlType\": \"TEXTAREA\", \"config\": { \"readonly\": true } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"Conteo Estimado de Destinatarios (APICLI)\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"totalDestinatarios\", \"label\": \"Total Destinatarios Identificados\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"totalWhatsapp\", \"label\": \"Destinatarios WhatsApp\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"totalEmail\", \"label\": \"Destinatarios Correo\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"totalSms\", \"label\": \"Destinatarios SMS\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } }\n" +
               "          ]\n" +
               "        },\n" +
               "        {\n" +
               "          \"title\": \"Aprobación del Envío Masivo\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"decision\", \"label\": \"¿Qué acción desea realizar?\", \"controlType\": \"COMBO\", \"required\": true, \"config\": { \"options\": [{\"id\":\"ENVIAR\",\"label\":\"Confirmar y Enviar Campaña Ahora\"},{\"id\":\"AJUSTAR\",\"label\":\"Regresar a Ajustar Notificación / Filtros\"},{\"id\":\"CANCELAR\",\"label\":\"Cancelar Campaña\"}] } },\n" +
               "            { \"name\": \"observacionesValidacion\", \"label\": \"Observaciones / Justificación\", \"controlType\": \"TEXTAREA\" }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }

    private String getRevisarResultadosLayout() {
        return "{\n" +
               "  \"tabs\": [\n" +
               "    {\n" +
               "      \"label\": \"Resultados Pos-Envío\",\n" +
               "      \"sections\": [\n" +
               "        {\n" +
               "          \"title\": \"Métricas Finales de Entrega y Lectura\",\n" +
               "          \"fields\": [\n" +
               "            { \"name\": \"totalEnviados\", \"label\": \"Total Mensajes Procesados\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"tasaEntrega\", \"label\": \"Tasa de Entrega Exitosa (%)\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"tasaApertura\", \"label\": \"Tasa de Apertura / Lectura (%)\", \"controlType\": \"TEXTBOX\", \"config\": { \"readonly\": true } },\n" +
               "            { \"name\": \"observacionesCierre\", \"label\": \"Comentarios / Informe de Cierre\", \"controlType\": \"TEXTAREA\" }\n" +
               "          ]\n" +
               "        }\n" +
               "      ]\n" +
               "    }\n" +
               "  ]\n" +
               "}";
    }
}
