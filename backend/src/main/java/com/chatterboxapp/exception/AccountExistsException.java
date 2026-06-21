package com.chatterboxapp.exception;

public class AccountExistsException extends RuntimeException {

  public AccountExistsException() {
    super("An account with this email already exists. Please sign in instead.");
  }
}
