import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;

public class CheckData {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM lead");
            if (rs.next()) {
                System.out.println("LEAD COUNT: " + rs.getInt(1));
            }
            rs = stmt.executeQuery("SELECT COUNT(*) FROM crm_lead");
            if (rs.next()) {
                System.out.println("CRM_LEAD COUNT: " + rs.getInt(1));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
