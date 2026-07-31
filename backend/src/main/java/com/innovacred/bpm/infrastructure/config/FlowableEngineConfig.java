package com.innovacred.bpm.infrastructure.config;

import lombok.RequiredArgsConstructor;
import org.flowable.spring.SpringProcessEngineConfiguration;
import org.flowable.spring.boot.EngineConfigurationConfigurer;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;

@Configuration
@RequiredArgsConstructor
public class FlowableEngineConfig implements EngineConfigurationConfigurer<SpringProcessEngineConfiguration> {

    private final GlobalTaskCreatedListener globalTaskCreatedListener;
    private final GlobalTaskEventListener globalTaskEventListener;

    @Override
    public void configure(SpringProcessEngineConfiguration engineConfiguration) {
        if (engineConfiguration.getEventListeners() == null) {
            engineConfiguration.setEventListeners(new ArrayList<>());
        }
        engineConfiguration.getEventListeners().add(globalTaskCreatedListener);
        engineConfiguration.getEventListeners().add(globalTaskEventListener);
    }
}
