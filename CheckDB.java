import java.sql.*;
public class CheckDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT layout_json FROM screen_definition WHERE id = 19");
            if (rs.next()) {
                String json = rs.getString(1);
                int idx = json.indexOf("parentesco");
                System.out.println(json.substring(Math.max(0, idx - 100), Math.min(json.length(), idx + 200)));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
