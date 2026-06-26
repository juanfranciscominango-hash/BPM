import java.sql.*;
public class QueryDMN3 {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT resource_bytes_ FROM act_dmn_deployment_resource WHERE deployment_id_ = (SELECT deployment_id_ FROM act_dmn_decision ORDER BY version_ DESC LIMIT 1)");
        if(rs.next()) {
            System.out.println(new String(rs.getBytes(1)));
        }
    }
}
