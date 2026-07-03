import java.sql.*;
import java.nio.file.*;
public class DumpScreen19 {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT layout_json FROM screen_definition WHERE id = 19");
            if (rs.next()) {
                Files.writeString(Paths.get("screen19_db.json"), rs.getString(1));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
