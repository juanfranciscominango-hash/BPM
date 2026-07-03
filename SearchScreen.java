import java.sql.*;
public class SearchScreen {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/bpm_db", "postgres", "Desarrollo");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, name FROM form_pantalla WHERE layout_json LIKE '%Simulador Interactivo%'");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + " - " + rs.getString("name"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
