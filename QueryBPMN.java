import java.sql.*;
public class QueryBPMN {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM", "postgres", "Desarrollo");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT b.bytes_ FROM act_re_procdef p JOIN act_ge_bytearray b ON p.deployment_id_ = b.deployment_id_ AND p.resource_name_ = b.name_ WHERE p.key_ = 'Flujo_Credito_Completo' ORDER BY p.version_ DESC LIMIT 1");
        if(rs.next()) {
            System.out.println(new String(rs.getBytes(1)));
        }
    }
}
