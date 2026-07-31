package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.DynamicQueryService;
import com.innovacred.bpm.domain.dto.CaseQueryRequest;
import com.innovacred.bpm.domain.dto.CaseQueryResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queries")
@RequiredArgsConstructor
public class DynamicQueryController {

    private final DynamicQueryService queryService;

    @PostMapping("/cases")
    public ResponseEntity<List<CaseQueryResult>> executeCaseQuery(@RequestBody CaseQueryRequest request) {
        List<CaseQueryResult> results = queryService.executeQuery(request);
        return ResponseEntity.ok(results);
    }
}
