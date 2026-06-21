package com.chatterboxapp.exception;

public class NotWhitelistedException extends RuntimeException {

  public NotWhitelistedException() {
    super("This email is not whitelisted. Please contact an administrator to request access.");
  }
}
