import java.sql.*;
public class QueryVar {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT name_, text_ FROM act_hi_varinst WHERE proc_inst_id_ = (SELECT proc_inst_id_ FROM act_hi_procinst WHERE name_ = 'CRE240626190041' LIMIT 1) AND name_ LIKE 'rol%'");
        while(rs.next()) {
            System.out.println(rs.getString("name_") + " = " + rs.getString("text_"));
        }
    }
}
