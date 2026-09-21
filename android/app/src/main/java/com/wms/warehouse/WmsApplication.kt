package com.wms.warehouse

import android.app.Application

class WmsApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialization of database and background offline sync jobs if needed
    }
}
