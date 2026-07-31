import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT key, name FROM process_definition");
            while (rs.next()) {
                System.out.println("Row -> key: " + rs.getString("key") + ", name: " + rs.getString("name"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
