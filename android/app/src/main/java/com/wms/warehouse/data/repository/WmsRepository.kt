package com.wms.warehouse.data.repository

import com.wms.warehouse.data.local.*
import com.wms.warehouse.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.*

class WmsRepository(private val dao: WmsDao) {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    fun getAllStock(): Flow<List<StockItem>> {
        return dao.getAllStock().map { list -> list.map { it.toDomain() } }
    }

    fun getStockByWarehouse(whId: String): Flow<List<StockItem>> {
        return dao.getStockByWarehouse(whId).map { list -> list.map { it.toDomain() } }
    }

    fun searchStock(query: String): Flow<List<StockItem>> {
        return dao.searchStock(query).map { list -> list.map { it.toDomain() } }
    }

    suspend fun getStockByCode(code: String): List<StockItem> {
        return dao.getStockByCode(code).map { it.toDomain() }
    }

    suspend fun getMaterialByCode(code: String): Material? {
        return dao.getMaterialByCode(code)?.toDomain()
    }

    fun getRecentMovements(limit: Int = 50): Flow<List<StockMovement>> {
        return dao.getRecentMovements(limit).map { list -> list.map { it.toDomain() } }
    }

    /**
     * Entrée de stock (Receipt)
     */
    suspend fun performReceipt(
        materialCode: String,
        warehouseId: String,
        binLocation: String,
        quantity: Double,
        unitPrice: Double,
        referenceNumber: String?,
        supplier: String?,
        user: User
    ): Result<StockMovement> {
        if (quantity <= 0) {
            return Result.failure(IllegalArgumentException("La quantité reçue doit être strictement positive."))
        }

        val stockId = "${warehouseId}_${materialCode}_${binLocation}"
        val timestamp = dateFormat.format(Date())
        val existingStock = dao.getStockById(stockId)

        val prevQty = existingStock?.quantity ?: 0.0
        val newQty = prevQty + quantity
        val price = if (unitPrice > 0) unitPrice else (existingStock?.unitPrice ?: 0.0)

        val updatedStock = StockEntity(
            id = stockId,
            materialId = materialCode,
            materialCode = materialCode,
            materialName = existingStock?.materialName ?: "Matériel $materialCode",
            chineseName = existingStock?.chineseName,
            specification = existingStock?.specification,
            warehouseId = warehouseId,
            binLocation = binLocation,
            uom = existingStock?.uom ?: "EA",
            quantity = newQty,
            reservedQuantity = 0.0,
            availableQuantity = newQty,
            unitPrice = price,
            totalValue = Math.round(newQty * price * 100.0) / 100.0,
            remarks = existingStock?.remarks,
            lastUpdated = timestamp
        )

        val movement = StockMovementEntity(
            id = "MOV-REC-${System.currentTimeMillis()}-${(100..999).random()}",
            movementType = MovementType.RECEIPT.name,
            materialId = materialCode,
            materialCode = materialCode,
            materialName = updatedStock.materialName,
            warehouseId = warehouseId,
            binLocation = binLocation,
            quantity = quantity,
            previousQuantity = prevQty,
            newQuantity = newQty,
            unitPrice = price,
            totalAmount = Math.round(quantity * price * 100.0) / 100.0,
            referenceNumber = referenceNumber ?: "BL-${System.currentTimeMillis()}",
            transferId = null,
            destinationWarehouseId = null,
            destinationBinLocation = null,
            reason = null,
            department = null,
            requester = null,
            supplier = supplier,
            performedBy = user.id,
            performedByName = user.name,
            createdAt = timestamp
        )

        dao.insertStockItem(updatedStock)
        dao.insertMovement(movement)

        return Result.success(movement.toDomain())
    }

    /**
     * Sortie de stock (Issue) — Strict check against available quantity
     */
    suspend fun performIssue(
        stockId: String,
        quantity: Double,
        requester: String,
        department: String?,
        referenceNumber: String?,
        reason: String?,
        user: User
    ): Result<StockMovement> {
        if (quantity <= 0) {
            return Result.failure(IllegalArgumentException("La quantité sortie doit être strictement positive."))
        }

        val stock = dao.getStockById(stockId)
            ?: return Result.failure(IllegalArgumentException("Article de stock introuvable."))

        if (stock.availableQuantity < quantity) {
            return Result.failure(
                IllegalArgumentException("Quantité insuffisante ! Disponible: ${stock.availableQuantity} ${stock.uom}, Demandé: $quantity.")
            )
        }

        val timestamp = dateFormat.format(Date())
        val prevQty = stock.quantity
        val newQty = prevQty - quantity

        val updatedStock = stock.copy(
            quantity = newQty,
            availableQuantity = newQty - stock.reservedQuantity,
            totalValue = Math.round(newQty * stock.unitPrice * 100.0) / 100.0,
            lastUpdated = timestamp
        )

        val movement = StockMovementEntity(
            id = "MOV-ISS-${System.currentTimeMillis()}-${(100..999).random()}",
            movementType = MovementType.ISSUE.name,
            materialId = stock.materialId,
            materialCode = stock.materialCode,
            materialName = stock.materialName,
            warehouseId = stock.warehouseId,
            binLocation = stock.binLocation,
            quantity = quantity,
            previousQuantity = prevQty,
            newQuantity = newQty,
            unitPrice = stock.unitPrice,
            totalAmount = Math.round(quantity * stock.unitPrice * 100.0) / 100.0,
            referenceNumber = referenceNumber ?: "BS-${System.currentTimeMillis()}",
            transferId = null,
            destinationWarehouseId = null,
            destinationBinLocation = null,
            reason = reason,
            department = department,
            requester = requester,
            supplier = null,
            performedBy = user.id,
            performedByName = user.name,
            createdAt = timestamp
        )

        dao.insertStockItem(updatedStock)
        dao.insertMovement(movement)

        return Result.success(movement.toDomain())
    }

    /**
     * Transfert B1 ↔ B2 ou Inter-BIN (Linked transfer movements)
     */
    suspend fun performTransfer(
        sourceStockId: String,
        destWarehouseId: String,
        destBinLocation: String,
        quantity: Double,
        reason: String?,
        user: User
    ): Result<Pair<StockMovement, StockMovement>> {
        if (quantity <= 0) {
            return Result.failure(IllegalArgumentException("La quantité transférée doit être strictement positive."))
        }

        val sourceStock = dao.getStockById(sourceStockId)
            ?: return Result.failure(IllegalArgumentException("Stock source introuvable."))

        if (sourceStock.availableQuantity < quantity) {
            return Result.failure(
                IllegalArgumentException("Quantité insuffisante pour le transfert ! Disponible: ${sourceStock.availableQuantity}.")
            )
        }

        val transferId = "TRF-${System.currentTimeMillis()}-${(100..999).random()}"
        val timestamp = dateFormat.format(Date())

        // 1. Decrease source
        val srcPrev = sourceStock.quantity
        val srcNew = srcPrev - quantity
        val updatedSource = sourceStock.copy(
            quantity = srcNew,
            availableQuantity = srcNew - sourceStock.reservedQuantity,
            totalValue = Math.round(srcNew * sourceStock.unitPrice * 100.0) / 100.0,
            lastUpdated = timestamp
        )

        // 2. Increase destination
        val destStockId = "${destWarehouseId}_${sourceStock.materialId}_${destBinLocation}"
        val destExisting = dao.getStockById(destStockId)
        val destPrev = destExisting?.quantity ?: 0.0
        val destNew = destPrev + quantity

        val updatedDest = StockEntity(
            id = destStockId,
            materialId = sourceStock.materialId,
            materialCode = sourceStock.materialCode,
            materialName = sourceStock.materialName,
            chineseName = sourceStock.chineseName,
            specification = sourceStock.specification,
            warehouseId = destWarehouseId,
            binLocation = destBinLocation,
            uom = sourceStock.uom,
            quantity = destNew,
            reservedQuantity = 0.0,
            availableQuantity = destNew,
            unitPrice = sourceStock.unitPrice,
            totalValue = Math.round(destNew * sourceStock.unitPrice * 100.0) / 100.0,
            remarks = "Transféré depuis ${sourceStock.warehouseId} (${sourceStock.binLocation})",
            lastUpdated = timestamp
        )

        // 3. Dual linked movements
        val movOut = StockMovementEntity(
            id = "MOV-TRF-OUT-${System.currentTimeMillis()}",
            movementType = MovementType.TRANSFER_OUT.name,
            materialId = sourceStock.materialId,
            materialCode = sourceStock.materialCode,
            materialName = sourceStock.materialName,
            warehouseId = sourceStock.warehouseId,
            binLocation = sourceStock.binLocation,
            quantity = quantity,
            previousQuantity = srcPrev,
            newQuantity = srcNew,
            unitPrice = sourceStock.unitPrice,
            totalAmount = Math.round(quantity * sourceStock.unitPrice * 100.0) / 100.0,
            referenceNumber = transferId,
            transferId = transferId,
            destinationWarehouseId = destWarehouseId,
            destinationBinLocation = destBinLocation,
            reason = reason,
            department = null,
            requester = null,
            supplier = null,
            performedBy = user.id,
            performedByName = user.name,
            createdAt = timestamp
        )

        val movIn = StockMovementEntity(
            id = "MOV-TRF-IN-${System.currentTimeMillis()}",
            movementType = MovementType.TRANSFER_IN.name,
            materialId = sourceStock.materialId,
            materialCode = sourceStock.materialCode,
            materialName = sourceStock.materialName,
            warehouseId = destWarehouseId,
            binLocation = destBinLocation,
            quantity = quantity,
            previousQuantity = destPrev,
            newQuantity = destNew,
            unitPrice = sourceStock.unitPrice,
            totalAmount = Math.round(quantity * sourceStock.unitPrice * 100.0) / 100.0,
            referenceNumber = transferId,
            transferId = transferId,
            destinationWarehouseId = destWarehouseId,
            destinationBinLocation = destBinLocation,
            reason = reason,
            department = null,
            requester = null,
            supplier = null,
            performedBy = user.id,
            performedByName = user.name,
            createdAt = timestamp
        )

        dao.insertStockItem(updatedSource)
        dao.insertStockItem(updatedDest)
        dao.insertMovement(movOut)
        dao.insertMovement(movIn)

        return Result.success(Pair(movOut.toDomain(), movIn.toDomain()))
    }

    /**
     * Inventaire physique (Adjustment)
     */
    suspend fun performInventoryAdjustment(
        stockId: String,
        physicalQuantity: Double,
        reason: String,
        user: User
    ): Result<StockMovement> {
        val stock = dao.getStockById(stockId)
            ?: return Result.failure(IllegalArgumentException("Stock introuvable."))

        val diff = physicalQuantity - stock.quantity
        val timestamp = dateFormat.format(Date())

        val updatedStock = stock.copy(
            quantity = physicalQuantity,
            availableQuantity = physicalQuantity - stock.reservedQuantity,
            totalValue = Math.round(physicalQuantity * stock.unitPrice * 100.0) / 100.0,
            lastUpdated = timestamp
        )

        val movement = StockMovementEntity(
            id = "MOV-ADJ-${System.currentTimeMillis()}",
            movementType = MovementType.ADJUSTMENT.name,
            materialId = stock.materialId,
            materialCode = stock.materialCode,
            materialName = stock.materialName,
            warehouseId = stock.warehouseId,
            binLocation = stock.binLocation,
            quantity = Math.abs(diff),
            previousQuantity = stock.quantity,
            newQuantity = physicalQuantity,
            unitPrice = stock.unitPrice,
            totalAmount = Math.round(Math.abs(diff) * stock.unitPrice * 100.0) / 100.0,
            referenceNumber = "INV-${System.currentTimeMillis()}",
            transferId = null,
            destinationWarehouseId = null,
            destinationBinLocation = null,
            reason = "Régularisation inventaire: Écart de $diff ${stock.uom}. $reason",
            department = null,
            requester = null,
            supplier = null,
            performedBy = user.id,
            performedByName = user.name,
            createdAt = timestamp
        )

        dao.insertStockItem(updatedStock)
        dao.insertMovement(movement)

        return Result.success(movement.toDomain())
    }

    // Converters
    private fun StockEntity.toDomain() = StockItem(
        id = id,
        materialId = materialId,
        materialCode = materialCode,
        materialName = materialName,
        chineseName = chineseName,
        specification = specification,
        warehouseId = warehouseId,
        binLocation = binLocation,
        uom = uom,
        quantity = quantity,
        reservedQuantity = reservedQuantity,
        availableQuantity = availableQuantity,
        unitPrice = unitPrice,
        totalValue = totalValue,
        remarks = remarks,
        lastUpdated = lastUpdated,
        imageUrl = imageUrl
    )

    private fun MaterialEntity.toDomain() = Material(
        id = id,
        materialCode = materialCode,
        name = name,
        chineseName = chineseName,
        description = description,
        specification = specification,
        uom = uom,
        standardPrice = standardPrice,
        currency = currency,
        plant = plant,
        requiresMaterialCodeReview = requiresMaterialCodeReview,
        imageUrl = imageUrl
    )

    private fun StockMovementEntity.toDomain() = StockMovement(
        id = id,
        movementType = MovementType.valueOf(movementType),
        materialId = materialId,
        materialCode = materialCode,
        materialName = materialName,
        warehouseId = warehouseId,
        binLocation = binLocation,
        quantity = quantity,
        previousQuantity = previousQuantity,
        newQuantity = newQuantity,
        unitPrice = unitPrice,
        totalAmount = totalAmount,
        referenceNumber = referenceNumber,
        transferId = transferId,
        destinationWarehouseId = destinationWarehouseId,
        destinationBinLocation = destinationBinLocation,
        reason = reason,
        department = department,
        requester = requester,
        supplier = supplier,
        performedBy = performedBy,
        performedByName = performedByName,
        createdAt = createdAt
    )
}
