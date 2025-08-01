package com.innovation.config;

import com.innovation.security.JwtRequestFilter;
import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<Filter> jwtFilter(JwtRequestFilter jwtRequestFilter) {
        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(jwtRequestFilter);
        // This will apply the filter to ALL requests
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }
}