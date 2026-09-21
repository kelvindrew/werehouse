package com.wms.warehouse.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wms.warehouse.data.model.*
import com.wms.warehouse.data.repository.WmsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class WmsUiState(
    val selectedWarehouse: String = "ALL", // "ALL", "B1", "B2"
    val searchQuery: String = "",
    val stockItems: List<StockItem> = emptyList(),
    val recentMovements: List<StockMovement> = emptyList(),
    val scannedItem: StockItem? = null,
    val scannedMaterialsList: List<StockItem> = emptyList(),
    val isLoading: Boolean = false,
    val userMessage: String? = null,
    val errorMessage: String? = null
)

class WmsViewModel(private val repository: WmsRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(WmsUiState())
    val uiState: StateFlow<WmsUiState> = _uiState.asStateFlow()

    // Default logged-in mobile user
    val currentUser = User(
        id = "USR-STORE-MOBILE",
        employeeId = "EMP-003",
        name = "Magasinier Android",
        email = "storekeeper@warehouse.internal",
        role = "STOREKEEPER",
        warehouseAccess = listOf("B1", "B2")
    )

    init {
        loadStock()
        loadMovements()
    }

    fun setSelectedWarehouse(wh: String) {
        _uiState.update { it.copy(selectedWarehouse = wh) }
        loadStock()
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        loadStock()
    }

    private fun loadStock() {
        viewModelScope.launch {
            val q = _uiState.value.searchQuery.trim()
            val wh = _uiState.value.selectedWarehouse

            val flow = if (q.isNotEmpty()) {
                repository.searchStock(q)
            } else if (wh != "ALL") {
                repository.getStockByWarehouse(wh)
            } else {
                repository.getAllStock()
            }

            flow.collect { items ->
                val filtered = if (wh != "ALL" && q.isNotEmpty()) {
                    items.filter { it.warehouseId == wh }
                } else items

                _uiState.update { it.copy(stockItems = filtered) }
            }
        }
    }

    private fun loadMovements() {
        viewModelScope.launch {
            repository.getRecentMovements(30).collect { moves ->
                _uiState.update { it.copy(recentMovements = moves) }
            }
        }
    }

    fun onBarcodeScanned(code: String) {
        viewModelScope.launch {
            val clean = code.trim()
            val finalCode = if (clean.startsWith("{") && clean.contains("\"code\"")) {
                try {
                    val json = org.json.JSONObject(clean)
                    json.optString("code", clean)
                } catch (e: Exception) {
                    clean
                }
            } else {
                clean
            }
            val matches = repository.getStockByCode(finalCode)
            _uiState.update {
                it.copy(
                    scannedItem = matches.firstOrNull(),
                    scannedMaterialsList = matches,
                    userMessage = if (matches.isNotEmpty()) "Matériel $finalCode identifié" else "Aucun stock pour $finalCode"
                )
            }
        }
    }

    fun clearScanned() {
        _uiState.update { it.copy(scannedItem = null, scannedMaterialsList = emptyList()) }
    }

    fun performReceipt(
        materialCode: String,
        warehouseId: String,
        binLocation: String,
        quantity: Double,
        unitPrice: Double,
        referenceNumber: String?,
        supplier: String?
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.performReceipt(
                materialCode = materialCode,
                warehouseId = warehouseId,
                binLocation = binLocation,
                quantity = quantity,
                unitPrice = unitPrice,
                referenceNumber = referenceNumber,
                supplier = supplier,
                user = currentUser
            )
            result.onSuccess { mov ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        userMessage = "Entrée validée : +$quantity de $materialCode sur $warehouseId ($binLocation)"
                    )
                }
            }.onFailure { err ->
                _uiState.update { it.copy(isLoading = false, errorMessage = err.message) }
            }
        }
    }

    fun performIssue(
        stockId: String,
        quantity: Double,
        requester: String,
        department: String?,
        referenceNumber: String?,
        reason: String?
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.performIssue(
                stockId = stockId,
                quantity = quantity,
                requester = requester,
                department = department,
                referenceNumber = referenceNumber,
                reason = reason,
                user = currentUser
            )
            result.onSuccess { mov ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        userMessage = "Sortie validée : -$quantity de ${mov.materialCode} pour $requester"
                    )
                }
            }.onFailure { err ->
                _uiState.update { it.copy(isLoading = false, errorMessage = err.message) }
            }
        }
    }

    fun performTransfer(
        sourceStockId: String,
        destWarehouseId: String,
        destBinLocation: String,
        quantity: Double,
        reason: String?
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.performTransfer(
                sourceStockId = sourceStockId,
                destWarehouseId = destWarehouseId,
                destBinLocation = destBinLocation,
                quantity = quantity,
                reason = reason,
                user = currentUser
            )
            result.onSuccess { pair ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        userMessage = "Transfert validé [${pair.first.transferId}] : $quantity unités vers $destWarehouseId ($destBinLocation)"
                    )
                }
            }.onFailure { err ->
                _uiState.update { it.copy(isLoading = false, errorMessage = err.message) }
            }
        }
    }

    fun performInventoryAdjustment(
        stockId: String,
        physicalQuantity: Double,
        reason: String
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = repository.performInventoryAdjustment(
                stockId = stockId,
                physicalQuantity = physicalQuantity,
                reason = reason,
                user = currentUser
            )
            result.onSuccess { mov ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        userMessage = "Régularisation inventaire validée : stock ajusté à $physicalQuantity"
                    )
                }
            }.onFailure { err ->
                _uiState.update { it.copy(isLoading = false, errorMessage = err.message) }
            }
        }
    }

    fun clearMessages() {
        _uiState.update { it.copy(userMessage = null, errorMessage = null) }
    }
}
