import java.sql.*;

public class QueryDMN {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT d.id_, d.key_, d.version_, b.bytes_ FROM act_dmn_decision d JOIN act_ge_bytearray b ON d.deployment_id_ = b.deployment_id_ ORDER BY d.version_ DESC LIMIT 1")) {
                if (rs.next()) {
                    System.out.println("ID: " + rs.getString("id_"));
                    System.out.println("Key: " + rs.getString("key_"));
                    System.out.println("Version: " + rs.getInt("version_"));
                    byte[] bytes = rs.getBytes("bytes_");
                    System.out.println(new String(bytes));
                }
            } catch(Exception e) {
                System.out.println("Error: " + e.getMessage());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
