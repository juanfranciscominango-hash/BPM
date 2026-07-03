import java.sql.*;
import java.nio.file.*;
public class DumpScreen25 {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT layout_json FROM screen_definition WHERE id = 25");
        if(rs.next()) {
            Files.writeString(Paths.get("screen25.json"), rs.getString(1));
            System.out.println("Dumped to screen25.json");
        }
    }
}
