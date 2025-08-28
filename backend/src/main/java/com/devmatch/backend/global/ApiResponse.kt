package com.devmatch.backend.global;

public record ApiResponse<T>(String msg, T data) {

  public ApiResponse(String msg) {
    this(msg, null);
  }
}
