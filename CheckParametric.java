import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;

public class CheckParametric {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery("SELECT name FROM parametric_table");
            while (rs.next()) {
                System.out.println("PARAMETRIC TABLE: " + rs.getString(1));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
