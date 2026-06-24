import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CleanTx {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Limpiando datos transaccionales...");
            
            // Tablas de aplicacion
            String[] appTables = {
                "crm_lead_interaction", "crm_lead_task", "crm_perfil_financiero", "crm_tarjeta_credito", "crm_deuda_externa", "crm_lead", "notification", "formula_history"
            };

            for (String table : appTables) {
                try {
                    stmt.execute("TRUNCATE TABLE " + table + " CASCADE");
                    System.out.println("Truncated " + table);
                } catch (Exception e) {
                    System.out.println("Failed to truncate " + table + ": " + e.getMessage());
                }
            }

            // Tablas de Flowable (Runtime y History) ya fueron borradas pero lo repetimos por si acaso
            String[] flowableTables = {
                "ACT_RU_VARIABLE", "ACT_RU_IDENTITYLINK", "ACT_RU_TASK", "ACT_RU_EXECUTION", "ACT_RU_EVENT_SUBSCR",
                "ACT_HI_VARINST", "ACT_HI_TASKINST", "ACT_HI_PROCINST", "ACT_HI_ACTINST", "ACT_HI_IDENTITYLINK",
                "ACT_HI_DETAIL", "ACT_HI_COMMENT", "ACT_HI_ATTACHMENT"
            };

            for (String table : flowableTables) {
                try {
                    stmt.execute("DELETE FROM " + table);
                } catch (Exception e) {
                }
            }

            System.out.println("Datos transaccionales eliminados exitosamente.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
