import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TestApi {
    public static void main(String[] args) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            // Since we get 401 without session, we won't get data.
            // But wait, does it require session? Let's check!
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:9091/api/v1/processes"))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("STATUS: " + response.statusCode());
            System.out.println("BODY: " + response.body());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
