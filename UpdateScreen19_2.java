import java.sql.*;
import java.nio.file.*;
public class UpdateScreen19_2 {
    public static void main(String[] args) {
        try {
            String json = Files.readString(Paths.get("screen19_db_updated2.json"));
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            PreparedStatement pstmt = conn.prepareStatement("UPDATE screen_definition SET layout_json = ? WHERE id = 19");
            pstmt.setString(1, json);
            int rows = pstmt.executeUpdate();
            System.out.println("Updated " + rows + " rows.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
