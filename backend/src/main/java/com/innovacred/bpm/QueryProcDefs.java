package com.innovacred.bpm;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryProcDefs {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/INC_BPM_PLATFORM";
        String user = "postgres";
        String password = "Desarrollo";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("--- DEPLOYED FLOWABLE PROCESS DEFINITIONS (ACT_RE_PROCDEF) ---");
            try (ResultSet rs = stmt.executeQuery("SELECT id_, key_, name_, version_ FROM act_re_procdef")) {
                while (rs.next()) {
                    System.out.printf("ID: %s | Key: %s | Name: %s | Version: %d%n",
                            rs.getString("id_"),
                            rs.getString("key_"),
                            rs.getString("name_"),
                            rs.getInt("version_"));
                }
            } catch (Exception e) {
                System.out.println("Error querying act_re_procdef: " + e.getMessage());
            }

            System.out.println("\n--- CUSTOM PROCESS DEFINITIONS (PROCESS_DEFINITION) ---");
            try (ResultSet rs = stmt.executeQuery("SELECT id, key, name, status, proc_def_id FROM process_definition")) {
                while (rs.next()) {
                    System.out.printf("ID: %d | Key: %s | Name: %s | Status: %s | ProcDefId: %s%n",
                            rs.getLong("id"),
                            rs.getString("key"),
                            rs.getString("name"),
                            rs.getString("status"),
                            rs.getString("proc_def_id"));
                }
            } catch (Exception e) {
                System.out.println("Error querying process_definition: " + e.getMessage());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
