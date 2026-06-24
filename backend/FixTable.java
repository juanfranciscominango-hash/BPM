import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixTable {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            stmt.execute("DROP TABLE IF EXISTS dy_solicitud_credito");
            System.out.println("Table dy_solicitud_credito dropped successfully!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
