package com.wms.warehouse.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.wms.warehouse.data.model.MovementType

@Entity(tableName = "materials")
data class MaterialEntity(
    @PrimaryKey val id: String,
    val materialCode: String,
    val name: String,
    val chineseName: String?,
    val description: String?,
    val specification: String?,
    val uom: String,
    val standardPrice: Double,
    val currency: String,
    val plant: String?,
    val requiresMaterialCodeReview: Boolean,
    val imageUrl: String? = null
)

@Entity(tableName = "stock")
data class StockEntity(
    @PrimaryKey val id: String,
    val materialId: String,
    val materialCode: String,
    val materialName: String,
    val chineseName: String?,
    val specification: String?,
    val warehouseId: String,
    val binLocation: String,
    val uom: String,
    val quantity: Double,
    val reservedQuantity: Double,
    val availableQuantity: Double,
    val unitPrice: Double,
    val totalValue: Double,
    val remarks: String?,
    val lastUpdated: String,
    val imageUrl: String? = null
)

@Entity(tableName = "movements")
data class StockMovementEntity(
    @PrimaryKey val id: String,
    val movementType: String,
    val materialId: String,
    val materialCode: String,
    val materialName: String,
    val warehouseId: String,
    val binLocation: String,
    val quantity: Double,
    val previousQuantity: Double,
    val newQuantity: Double,
    val unitPrice: Double,
    val totalAmount: Double,
    val referenceNumber: String?,
    val transferId: String?,
    val destinationWarehouseId: String?,
    val destinationBinLocation: String?,
    val reason: String?,
    val department: String?,
    val requester: String?,
    val supplier: String?,
    val performedBy: String,
    val performedByName: String,
    val createdAt: String,
    val isSynced: Boolean = true
)

@Entity(tableName = "pending_movements")
data class PendingMovementEntity(
    @PrimaryKey val idempotencyKey: String,
    val payloadJson: String,
    val createdAt: Long,
    val retryCount: Int = 0
)
