package com.innovacred.bpm.infrastructure.adapter.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/productos")
@Slf4j
public class ProductRestController {

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getProducts() {
        log.info("Consultando lista de productos mock");
        List<Map<String, String>> productos = new ArrayList<>();
        
        Map<String, String> p1 = new HashMap<>();
        p1.put("id", "PROD_CASA_MILITAR");
        p1.put("nombre", "BGR TU CASA MILITAR");
        p1.put("tasa_interes", "10.5");
        p1.put("plazo_minimo", "12");
        p1.put("plazo_maximo", "240");
        p1.put("monto_minimo", "10000");
        p1.put("monto_maximo", "150000");
        
        Map<String, String> p2 = new HashMap<>();
        p2.put("id", "PROD_VEHICULO");
        p2.put("nombre", "CREDITO VEHICULAR BGR");
        p2.put("tasa_interes", "14.5");
        p2.put("plazo_minimo", "6");
        p2.put("plazo_maximo", "72");
        p2.put("monto_minimo", "5000");
        p2.put("monto_maximo", "50000");
        
        Map<String, String> p3 = new HashMap<>();
        p3.put("id", "PROD_CONSUMO");
        p3.put("nombre", "CONSUMO NORMAL");
        p3.put("tasa_interes", "16.5");
        p3.put("plazo_minimo", "3");
        p3.put("plazo_maximo", "60");
        p3.put("monto_minimo", "500");
        p3.put("monto_maximo", "30000");
        
        productos.add(p1);
        productos.add(p2);
        productos.add(p3);
        
        return ResponseEntity.ok(productos);
    }
}
