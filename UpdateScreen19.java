import java.sql.*;
import java.nio.file.*;
public class UpdateScreen19 {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            PreparedStatement pstmt = conn.prepareStatement("UPDATE screen_definition SET layout_json = ?::json WHERE id = 19");
            String json = Files.readString(Paths.get("screen19_db_updated3.json"));
            pstmt.setString(1, json);
            int updated = pstmt.executeUpdate();
            System.out.println("Rows updated: " + updated);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
