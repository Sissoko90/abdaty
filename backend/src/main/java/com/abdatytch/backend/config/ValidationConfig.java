package com.abdatytch.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;

/**
 * Configuration de la validation des beans.
 * Configure le validateur et le processeur de validation de méthodes.
 */
@Configuration
public class ValidationConfig {

    /**
     * Configure le validateur de beans local.
     * 
     * @return le validateur de beans
     */
    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    /**
     * Configure le processeur de validation de méthodes.
     * Active la validation des paramètres de méthodes avec @Valid.
     * 
     * @return le processeur de validation de méthodes
     */
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
        processor.setValidator(validator());
        return processor;
    }
}
