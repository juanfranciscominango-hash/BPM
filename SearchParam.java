import java.sql.*;
public class SearchParam {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM pr_tipo_parentesco LIMIT 1");
            ResultSetMetaData rsmd = rs.getMetaData();
            for (int i = 1; i <= rsmd.getColumnCount(); i++) {
                System.out.println(rsmd.getColumnName(i));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
