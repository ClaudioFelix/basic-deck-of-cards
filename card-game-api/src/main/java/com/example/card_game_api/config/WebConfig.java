package com.example.card_game_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/games/**") // Aplica a regra a todos os endpoints sob /games
        .allowedOrigins("http://localhost:3000") // Permite requisições vindas do seu app React
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos HTTP permitidos
        .allowedHeaders("*") // Permite todos os cabeçalhos
        .allowCredentials(true);
  }
}