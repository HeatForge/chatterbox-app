package com.chatterboxapp.controller;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import javax.sql.DataSource;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

  private final DataSource dataSource;

  public HealthController(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @GetMapping("/health")
  public java.util.Map<String, String> health() {
    String dbStatus;
    try (Connection conn = dataSource.getConnection()) {
      DatabaseMetaData meta = conn.getMetaData();
      dbStatus = meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion();
    } catch (Exception e) {
      dbStatus = "unreachable: " + e.getMessage();
    }

    return java.util.Map.of(
        "status", "ok",
        "db", dbStatus
    );
  }
}