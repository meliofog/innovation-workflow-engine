package com.innovation.service;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("sendAlertDelegate")
public class SendAlertDelegate implements JavaDelegate {

    private static final Logger LOGGER = LoggerFactory.getLogger(SendAlertDelegate.class);

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long ideaId = (Long) execution.getVariable("ideaId");
        LOGGER.warn("ALERT: Deadline passed for Idea ID: {}", ideaId);
        // In a real application, you would send an email here.
    }
}