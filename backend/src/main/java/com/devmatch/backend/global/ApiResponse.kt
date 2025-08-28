package com.devmatch.backend.global

data class ApiResponse<T>(val msg: String, val data: T? = null)
