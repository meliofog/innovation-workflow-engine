package com.innovation.config;

import com.innovation.security.JwtRequestFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<JwtRequestFilter> jwtFilter(JwtRequestFilter jwtRequestFilter) {
        FilterRegistrationBean<JwtRequestFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(jwtRequestFilter);
        // Apply this filter to all of our custom API endpoints
        registrationBean.addUrlPatterns("/api/ideas/*", "/api/tasks/*", "/api/pocs/*");
        return registrationBean;
    }
}