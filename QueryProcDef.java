import java.sql.*;
public class QueryProcDef {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT p.version_, p.key_ FROM act_ru_execution e JOIN act_re_procdef p ON e.proc_def_id_ = p.id_ WHERE e.name_ = 'CRE240626190041'");
        if(rs.next()) {
            System.out.println("Version: " + rs.getInt(1) + ", Key: " + rs.getString(2));
        }
    }
}
