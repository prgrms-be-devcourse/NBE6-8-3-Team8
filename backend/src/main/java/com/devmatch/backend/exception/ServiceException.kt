package com.devmatch.backend.exception

import com.devmatch.backend.global.RsData


class ServiceException(private val resultCode: String, private val msg: String) : RuntimeException(
    "$resultCode : $msg"
) {
    val rsData: RsData<Void>
        get() = RsData<Void>(resultCode, msg)
}
