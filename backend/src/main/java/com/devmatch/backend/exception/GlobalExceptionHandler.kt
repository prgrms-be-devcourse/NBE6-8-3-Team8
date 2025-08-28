package com.devmatch.backend.exception

import com.devmatch.backend.global.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ApiResponse<Void> {
        val message = ex.bindingResult
            .allErrors
            .map { it as FieldError }
            .joinToString("\n") { error -> "${error.field}-${error.code}-${error.defaultMessage}" }

        return ApiResponse(message)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleHttpMessageNotReadable(ex: HttpMessageNotReadableException): ApiResponse<Void> {
        return ApiResponse("요청 값이 올바르지 않습니다: " + ex.mostSpecificCause.message)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleIllegalArgument(ex: IllegalArgumentException): ApiResponse<Void> =
        ApiResponse(ex.message ?: "유효하지 않은 인자입니다")

    @ExceptionHandler(NoSuchElementException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleNoSuchElement(ex: NoSuchElementException): ApiResponse<Void> =
        ApiResponse(ex.message ?: "요청한 리소스를 찾을 수 없습니다")
}