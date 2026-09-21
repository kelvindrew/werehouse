package com.wms.warehouse.data.model

data class User(
    val id: String,
    val employeeId: String,
    val name: String,
    val email: String,
    val role: String, // ADMIN, SUPERVISOR, STOREKEEPER, VIEWER
    val language: String = "fr", // fr, en, zh
    val warehouseAccess: List<String>
)

data class Warehouse(
    val id: String,
    val code: String,
    val name: String,
    val description: String,
    val totalQuantity: Double = 0.0,
    val totalValuationUSD: Double = 0.0
)

data class Material(
    val id: String,
    val materialCode: String,
    val name: String,
    val chineseName: String? = null,
    val description: String? = null,
    val specification: String? = null,
    val uom: String = "EA",
    val standardPrice: Double = 0.0,
    val currency: String = "USD",
    val plant: String? = null,
    val requiresMaterialCodeReview: Boolean = false,
    val imageUrl: String? = null
)

data class StockItem(
    val id: String, // e.g. B1_40722580_MD01
    val materialId: String,
    val materialCode: String,
    val materialName: String,
    val chineseName: String? = null,
    val specification: String? = null,
    val warehouseId: String, // B1, B2
    val binLocation: String,
    val uom: String,
    val quantity: Double,
    val reservedQuantity: Double = 0.0,
    val availableQuantity: Double,
    val unitPrice: Double,
    val totalValue: Double,
    val remarks: String? = null,
    val lastUpdated: String,
    val imageUrl: String? = null
)

enum class MovementType {
    RECEIPT,
    ISSUE,
    TRANSFER_IN,
    TRANSFER_OUT,
    RETURN,
    ADJUSTMENT,
    INVENTORY_CORRECTION,
    INITIAL_IMPORT
}

data class StockMovement(
    val id: String,
    val movementType: MovementType,
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
    val referenceNumber: String? = null,
    val transferId: String? = null,
    val destinationWarehouseId: String? = null,
    val destinationBinLocation: String? = null,
    val reason: String? = null,
    val department: String? = null,
    val requester: String? = null,
    val supplier: String? = null,
    val performedBy: String,
    val performedByName: String,
    val createdAt: String,
    val idempotencyKey: String? = null
)
