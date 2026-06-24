package com.innovacred.bpm.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class CryptoService {

    private static final String AES_ALGO = "AES/CBC/PKCS5Padding";
    private static final String RSA_ALGO = "RSA/ECB/OAEPWithSHA-1AndMGF1Padding";

    private PublicKey publicKeyIda;
    private PrivateKey privateKeyVuelta;

    public CryptoService() {
        // En producción las rutas deben ser configurables, para desarrollo simularemos o leeremos rutas fijas.
        try {
            loadKeys();
        } catch (Exception e) {
            log.warn("No se pudieron cargar las llaves RSA: {}. Se generarán unas en memoria para desarrollo.", e.getMessage());
            generateTemporaryKeys();
        }
    }

    private void loadKeys() throws Exception {
        // Intentar leer las llaves de la ubicación especificada en la documentación
        File pubFile = new File("/ida/publicKey.pem");
        File privFile = new File("/vuelta/privateKey.pem");

        if (pubFile.exists() && privFile.exists()) {
            String pubKeyStr = new String(Files.readAllBytes(pubFile.toPath()))
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] pubKeyBytes = Base64.getDecoder().decode(pubKeyStr);
            X509EncodedKeySpec pubSpec = new X509EncodedKeySpec(pubKeyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.publicKeyIda = kf.generatePublic(pubSpec);

            String privKeyStr = new String(Files.readAllBytes(privFile.toPath()))
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] privKeyBytes = Base64.getDecoder().decode(privKeyStr);
            PKCS8EncodedKeySpec privSpec = new PKCS8EncodedKeySpec(privKeyBytes);
            this.privateKeyVuelta = kf.generatePrivate(privSpec);
            log.info("Llaves RSA cargadas exitosamente.");
        } else {
            throw new RuntimeException("Archivos de llaves no encontrados en /ida/ o /vuelta/");
        }
    }

    private void generateTemporaryKeys() {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(4096);
            KeyPair pair = keyGen.generateKeyPair();
            this.publicKeyIda = pair.getPublic();
            this.privateKeyVuelta = pair.getPrivate();
            log.info("Llaves RSA generadas en memoria.");
        } catch (Exception e) {
            log.error("Error generando llaves en memoria", e);
        }
    }

    public Map<String, String> encryptRequest(String plainJson) {
        try {
            // 1. Generar AES Key (32 bytes) y IV (16 bytes) aleatorios como Strings legibles (según el ejemplo del doc)
            byte[] keyBytes = new byte[32];
            byte[] ivBytes = new byte[16];
            SecureRandom random = new SecureRandom();
            random.nextBytes(keyBytes);
            random.nextBytes(ivBytes);

            // El documento usa strings base64 o strings alfanuméricos como llaves secretas. Usaremos codificación hexadecimal o Base64 para que el servidor remoto lo entienda.
            // Según el ejemplo: "Clave secreta: 12345678901234567890123456789012" - usa strings literales
            String sessionKeyStr = Base64.getEncoder().encodeToString(keyBytes).substring(0, 32);
            String ivStr = Base64.getEncoder().encodeToString(ivBytes).substring(0, 16);

            SecretKey secretKey = new SecretKeySpec(sessionKeyStr.getBytes(StandardCharsets.UTF_8), "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivStr.getBytes(StandardCharsets.UTF_8));

            // 2. Encriptar Data con AES256
            Cipher aesCipher = Cipher.getInstance(AES_ALGO);
            aesCipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
            byte[] encryptedData = aesCipher.doFinal(plainJson.getBytes(StandardCharsets.UTF_8));
            String dataBase64 = Base64.getEncoder().encodeToString(encryptedData);

            // 3. Encriptar SessionKey y IV con RSA Public Key
            Cipher rsaCipher = Cipher.getInstance(RSA_ALGO);
            rsaCipher.init(Cipher.ENCRYPT_MODE, this.publicKeyIda);
            
            byte[] encryptedSessionKey = rsaCipher.doFinal(sessionKeyStr.getBytes(StandardCharsets.UTF_8));
            byte[] encryptedIv = rsaCipher.doFinal(ivStr.getBytes(StandardCharsets.UTF_8));

            Map<String, String> result = new HashMap<>();
            result.put("SessionKey", Base64.getEncoder().encodeToString(encryptedSessionKey));
            result.put("IV", Base64.getEncoder().encodeToString(encryptedIv));
            result.put("Data", dataBase64);
            return result;

        } catch (Exception e) {
            log.error("Error encriptando petición", e);
            throw new RuntimeException("Error encriptando payload", e);
        }
    }

    public String decryptResponse(Map<String, String> encryptedJson) {
        try {
            String encSessionKey = encryptedJson.get("SessionKey");
            String encIv = encryptedJson.get("IV");
            String encData = encryptedJson.get("Data");

            // 1. Desencriptar SessionKey e IV con RSA Private Key
            Cipher rsaCipher = Cipher.getInstance(RSA_ALGO);
            rsaCipher.init(Cipher.DECRYPT_MODE, this.privateKeyVuelta);

            byte[] sessionKeyBytes = rsaCipher.doFinal(Base64.getDecoder().decode(encSessionKey));
            byte[] ivBytes = rsaCipher.doFinal(Base64.getDecoder().decode(encIv));

            // 2. Desencriptar Data con AES (Nota: el doc menciona TripleDES en una línea pero luego AES en otra. Usaremos AES como es el estándar de ida y vuelta a menos que falle)
            SecretKey secretKey = new SecretKeySpec(sessionKeyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

            Cipher aesCipher = Cipher.getInstance(AES_ALGO);
            aesCipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            byte[] decryptedData = aesCipher.doFinal(Base64.getDecoder().decode(encData));

            return new String(decryptedData, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Error desencriptando respuesta", e);
            throw new RuntimeException("Error desencriptando payload", e);
        }
    }

    // --- MÉTODOS PARA EL SERVIDOR MOCK ---

    public String decryptMockRequest(Map<String, String> encryptedRequest) {
        try {
            String encSessionKey = encryptedRequest.get("SessionKey");
            String encIv = encryptedRequest.get("IV");
            String encData = encryptedRequest.get("Data");

            // En el mock, desencriptamos SessionKey e IV usando nuestra propia PrivateKey
            Cipher rsaCipher = Cipher.getInstance(RSA_ALGO);
            rsaCipher.init(Cipher.DECRYPT_MODE, this.privateKeyVuelta); // usamos privateKeyVuelta porque generamos ambas iguales

            byte[] sessionKeyBytes = rsaCipher.doFinal(Base64.getDecoder().decode(encSessionKey));
            byte[] ivBytes = rsaCipher.doFinal(Base64.getDecoder().decode(encIv));

            SecretKey secretKey = new SecretKeySpec(sessionKeyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

            Cipher aesCipher = Cipher.getInstance(AES_ALGO);
            aesCipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            byte[] decryptedData = aesCipher.doFinal(Base64.getDecoder().decode(encData));

            return new String(decryptedData, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Error desencriptando peticion mock", e);
            throw new RuntimeException("Error desencriptando mock request", e);
        }
    }

    public Map<String, String> encryptMockResponse(String plainJson) {
        try {
            byte[] keyBytes = new byte[32];
            byte[] ivBytes = new byte[16];
            SecureRandom random = new SecureRandom();
            random.nextBytes(keyBytes);
            random.nextBytes(ivBytes);

            String sessionKeyStr = Base64.getEncoder().encodeToString(keyBytes).substring(0, 32);
            String ivStr = Base64.getEncoder().encodeToString(ivBytes).substring(0, 16);

            SecretKey secretKey = new SecretKeySpec(sessionKeyStr.getBytes(StandardCharsets.UTF_8), "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivStr.getBytes(StandardCharsets.UTF_8));

            Cipher aesCipher = Cipher.getInstance(AES_ALGO);
            aesCipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
            byte[] encryptedData = aesCipher.doFinal(plainJson.getBytes(StandardCharsets.UTF_8));
            String dataBase64 = Base64.getEncoder().encodeToString(encryptedData);

            Cipher rsaCipher = Cipher.getInstance(RSA_ALGO);
            rsaCipher.init(Cipher.ENCRYPT_MODE, this.publicKeyIda);
            
            byte[] encryptedSessionKey = rsaCipher.doFinal(sessionKeyStr.getBytes(StandardCharsets.UTF_8));
            byte[] encryptedIv = rsaCipher.doFinal(ivStr.getBytes(StandardCharsets.UTF_8));

            Map<String, String> result = new HashMap<>();
            result.put("SessionKey", Base64.getEncoder().encodeToString(encryptedSessionKey));
            result.put("IV", Base64.getEncoder().encodeToString(encryptedIv));
            result.put("Data", dataBase64);
            return result;
        } catch (Exception e) {
            log.error("Error encriptando respuesta mock", e);
            throw new RuntimeException("Error encriptando mock response", e);
        }
    }
}
