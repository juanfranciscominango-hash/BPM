import java.sql.*;
import java.nio.file.*;
public class SearchTables {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            DatabaseMetaData md = conn.getMetaData();
            ResultSet rs = md.getTables(null, null, "%", new String[]{"TABLE"});
            while (rs.next()) {
                System.out.println(rs.getString(3));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
