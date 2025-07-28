package com.innovation.service;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("noOpDelegate")
public class NoOpDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(NoOpDelegate.class);

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        LOGGER.info("No-Op Delegate called for activity: {}", execution.getCurrentActivityName());
        // This delegate does nothing on purpose.
        // We will replace it with real logic later.
    }
}