package com.wms.warehouse.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface WmsDao {

    @Query("SELECT * FROM stock WHERE warehouseId = :whId ORDER BY totalValue DESC")
    fun getStockByWarehouse(whId: String): Flow<List<StockEntity>>

    @Query("SELECT * FROM stock ORDER BY totalValue DESC")
    fun getAllStock(): Flow<List<StockEntity>>

    @Query("SELECT * FROM stock WHERE materialCode = :code OR materialId = :code")
    suspend fun getStockByCode(code: String): List<StockEntity>

    @Query("SELECT * FROM stock WHERE id = :stockId")
    suspend fun getStockById(stockId: String): StockEntity?

    @Query("SELECT * FROM materials WHERE materialCode = :code OR id = :code LIMIT 1")
    suspend fun getMaterialByCode(code: String): MaterialEntity?

    @Query("""
        SELECT * FROM stock 
        WHERE materialCode LIKE '%' || :query || '%' 
           OR materialName LIKE '%' || :query || '%' 
           OR chineseName LIKE '%' || :query || '%' 
           OR binLocation LIKE '%' || :query || '%'
        ORDER BY totalValue DESC
    """)
    fun searchStock(query: String): Flow<List<StockEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStock(stock: List<StockEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockItem(stock: StockEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMaterials(materials: List<MaterialEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMovement(movement: StockMovementEntity)

    @Query("SELECT * FROM movements ORDER BY createdAt DESC LIMIT :limit")
    fun getRecentMovements(limit: Int): Flow<List<StockMovementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPending(pending: PendingMovementEntity)

    @Query("SELECT * FROM pending_movements ORDER BY createdAt ASC")
    suspend fun getPendingMovements(): List<PendingMovementEntity>

    @Query("DELETE FROM pending_movements WHERE idempotencyKey = :key")
    suspend fun deletePending(key: String)
}
