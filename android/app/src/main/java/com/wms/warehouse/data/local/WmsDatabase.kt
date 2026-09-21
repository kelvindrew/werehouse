package com.wms.warehouse.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        MaterialEntity::class,
        StockEntity::class,
        StockMovementEntity::class,
        PendingMovementEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class WmsDatabase : RoomDatabase() {
    abstract fun wmsDao(): WmsDao

    companion object {
        @Volatile
        private var INSTANCE: WmsDatabase? = null

        fun getInstance(context: Context): WmsDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    WmsDatabase::class.java,
                    "wms_warehouse_database.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
