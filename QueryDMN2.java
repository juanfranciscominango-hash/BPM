import java.sql.*;
public class QueryDMN2 {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT key_ FROM act_dmn_decision");
        while(rs.next()) System.out.println(rs.getString(1));
    }
}
