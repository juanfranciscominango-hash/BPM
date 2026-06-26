import java.sql.*;

public class QueryDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            // Check DMN deployments
            System.out.println("--- DMN Decisions ---");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id_, key_, version_, deployment_id_ FROM act_dmn_decision ORDER BY version_ DESC LIMIT 5")) {
                while (rs.next()) {
                    System.out.println("ID: " + rs.getString("id_") + ", Key: " + rs.getString("key_") + ", Version: " + rs.getInt("version_"));
                }
            } catch(Exception e) {
                System.out.println("No act_dmn_decision table? " + e.getMessage());
            }

            // Check variables for the latest process
            System.out.println("--- Variables for CRE240626190041 ---");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT name_, type_, text_, text2_, double_ FROM act_ru_variable WHERE proc_inst_id_ = (SELECT proc_inst_id_ FROM act_ru_execution WHERE name_ = 'CRE240626190041' LIMIT 1)")) {
                while (rs.next()) {
                    System.out.println(rs.getString("name_") + " = " + rs.getString("text_") + " | " + rs.getDouble("double_"));
                }
            } catch(Exception e) {
                System.out.println("Error querying variables: " + e.getMessage());
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
