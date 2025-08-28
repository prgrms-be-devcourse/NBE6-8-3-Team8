package com.devmatch.backend.exception

import com.devmatch.backend.global.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Void>> {
        val message = ex.bindingResult
            .allErrors
            .map { it as FieldError }
            .joinToString("\n") { error -> "${error.field}-${error.code}-${error.defaultMessage}" }

        return ResponseEntity.badRequest().body(ApiResponse(message))
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadable(ex: HttpMessageNotReadableException): ResponseEntity<ApiResponse<Void>> {
        return ResponseEntity.badRequest()
            .body(ApiResponse("요청 값이 올바르지 않습니다: " + ex.mostSpecificCause.message))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException): ResponseEntity<ApiResponse<Void>> =
        ResponseEntity.badRequest().body(ApiResponse(ex.message))

    @ExceptionHandler(NoSuchElementException::class)
    fun handleNoSuchElement(ex: NoSuchElementException): ResponseEntity<ApiResponse<Void>> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(ex.message))
}