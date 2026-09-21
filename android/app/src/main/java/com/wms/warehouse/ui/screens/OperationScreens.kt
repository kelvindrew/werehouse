package com.wms.warehouse.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wms.warehouse.data.model.StockItem
import com.wms.warehouse.ui.theme.*
import com.wms.warehouse.ui.viewmodel.WmsViewModel

@Composable
fun ReceiptScreen(
    viewModel: WmsViewModel,
    initialItem: StockItem?,
    onNavigateBack: () -> Unit
) {
    var materialCode by remember { mutableStateOf(initialItem?.materialCode ?: "") }
    var warehouseId by remember { mutableStateOf(initialItem?.warehouseId ?: "B1") }
    var binLocation by remember { mutableStateOf(initialItem?.binLocation ?: "") }
    var quantity by remember { mutableStateOf("") }
    var unitPrice by remember { mutableStateOf(initialItem?.unitPrice?.toString() ?: "") }
    var referenceNumber by remember { mutableStateOf("") }
    var supplier by remember { mutableStateOf("") }

    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSlate950)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Retour", tint = TextPrimary)
            }
            Text(
                text = "Entrée de Stock (Réception)",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = materialCode,
            onValueChange = { materialCode = it },
            label = { Text("Code Matériel *") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
                value = warehouseId,
                onValueChange = { warehouseId = it },
                label = { Text("Entrepôt (B1/B2) *") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            )
            OutlinedTextField(
                value = binLocation,
                onValueChange = { binLocation = it },
                label = { Text("BIN Location *") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
                value = quantity,
                onValueChange = { quantity = it },
                label = { Text("Quantité Reçue *") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            )
            OutlinedTextField(
                value = unitPrice,
                onValueChange = { unitPrice = it },
                label = { Text("Prix Unitaire ($)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = referenceNumber,
            onValueChange = { referenceNumber = it },
            label = { Text("N° Bon / Document") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = supplier,
            onValueChange = { supplier = it },
            label = { Text("Fournisseur") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                val qtyNum = quantity.toDoubleOrNull() ?: 0.0
                val priceNum = unitPrice.toDoubleOrNull() ?: 0.0
                if (materialCode.isNotEmpty() && binLocation.isNotEmpty() && qtyNum > 0) {
                    viewModel.performReceipt(
                        materialCode = materialCode.trim(),
                        warehouseId = warehouseId.trim().uppercase(),
                        binLocation = binLocation.trim().uppercase(),
                        quantity = qtyNum,
                        unitPrice = priceNum,
                        referenceNumber = referenceNumber.takeIf { it.isNotBlank() },
                        supplier = supplier.takeIf { it.isNotBlank() }
                    )
                    onNavigateBack()
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
        ) {
            Text("Valider la Réception", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun IssueScreen(
    viewModel: WmsViewModel,
    initialItem: StockItem?,
    onNavigateBack: () -> Unit
) {
    var quantity by remember { mutableStateOf("") }
    var requester by remember { mutableStateOf("") }
    var department by remember { mutableStateOf("") }
    var referenceNumber by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }

    val stockItem = initialItem

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSlate950)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Retour", tint = TextPrimary)
            }
            Text(
                text = "Sortie de Stock",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        stockItem?.let { item ->
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSlate900),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = item.materialCode,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = BlueLight
                    )
                    Text(text = item.materialName, fontSize = 12.sp, color = TextPrimary)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "[${item.warehouseId} - ${item.binLocation}]", fontSize = 12.sp, color = TextSecondary)
                        Text(
                            text = "Stock disponible : ${item.availableQuantity} ${item.uom}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF22C55E)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = quantity,
            onValueChange = { quantity = it },
            label = { Text("Quantité à Sortir *") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = requester,
            onValueChange = { requester = it },
            label = { Text("Demandeur (Bénéficiaire) *") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = department,
            onValueChange = { department = it },
            label = { Text("Département / Équipe") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = referenceNumber,
            onValueChange = { referenceNumber = it },
            label = { Text("N° Bon de Sortie / OT") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = reason,
            onValueChange = { reason = it },
            label = { Text("Motif de sortie") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        val qtyNum = quantity.toDoubleOrNull() ?: 0.0
        val maxAvailable = stockItem?.availableQuantity ?: 0.0

        Button(
            onClick = {
                if (stockItem != null && qtyNum > 0 && qtyNum <= maxAvailable && requester.isNotBlank()) {
                    viewModel.performIssue(
                        stockId = stockItem.id,
                        quantity = qtyNum,
                        requester = requester.trim(),
                        department = department.takeIf { it.isNotBlank() },
                        referenceNumber = referenceNumber.takeIf { it.isNotBlank() },
                        reason = reason.takeIf { it.isNotBlank() }
                    )
                    onNavigateBack()
                }
            },
            enabled = qtyNum in 0.001..maxAvailable && requester.isNotBlank(),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AmberIssue)
        ) {
            Text("Valider la Sortie", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun TransferScreen(
    viewModel: WmsViewModel,
    initialItem: StockItem?,
    onNavigateBack: () -> Unit
) {
    var destWarehouse by remember { mutableStateOf(if (initialItem?.warehouseId == "B1") "B2" else "B1") }
    var destBin by remember { mutableStateOf("") }
    var quantity by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }

    val stockItem = initialItem

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSlate950)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Retour", tint = TextPrimary)
            }
            Text(
                text = "Transfert B1 ↔ B2",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        stockItem?.let { item ->
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSlate900),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = item.materialCode,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = IndigoTransfer
                    )
                    Text(text = item.materialName, fontSize = 12.sp, color = TextPrimary)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Source : ${item.warehouseId} (${item.binLocation}) • Dispo : ${item.availableQuantity} ${item.uom}",
                        fontSize = 12.sp,
                        color = Color(0xFF22C55E)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
                value = destWarehouse,
                onValueChange = { destWarehouse = it },
                label = { Text("WH Dest (B1/B2)") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            )
            OutlinedTextField(
                value = destBin,
                onValueChange = { destBin = it },
                label = { Text("BIN Destination *") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = quantity,
            onValueChange = { quantity = it },
            label = { Text("Quantité à Transférer *") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = reason,
            onValueChange = { reason = it },
            label = { Text("Motif du Transfert") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        val qtyNum = quantity.toDoubleOrNull() ?: 0.0
        val maxAvailable = stockItem?.availableQuantity ?: 0.0

        Button(
            onClick = {
                if (stockItem != null && qtyNum in 0.001..maxAvailable && destBin.isNotBlank()) {
                    viewModel.performTransfer(
                        sourceStockId = stockItem.id,
                        destWarehouseId = destWarehouse.trim().uppercase(),
                        destBinLocation = destBin.trim().uppercase(),
                        quantity = qtyNum,
                        reason = reason.takeIf { it.isNotBlank() }
                    )
                    onNavigateBack()
                }
            },
            enabled = qtyNum in 0.001..maxAvailable && destBin.isNotBlank(),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = IndigoTransfer)
        ) {
            Text("Valider le Transfert", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun InventoryScreen(
    viewModel: WmsViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedStockItem by remember { mutableStateOf<StockItem?>(null) }
    var physicalCount by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSlate950)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Retour", tint = TextPrimary)
            }
            Text(
                text = "Inventaire & Régularisation",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Sélectionnez un article pour ajuster son stock physique :",
            fontSize = 12.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Quick picker from first 10 items
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            uiState.stockItems.take(5).forEach { item ->
                val isSelected = selectedStockItem?.id == item.id
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) BluePrimary.copy(alpha = 0.2f) else DarkSlate900,
                    border = if (isSelected) CardDefaults.outlinedCardBorder() else null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = item.materialCode, fontWeight = FontWeight.Bold, color = BlueLight, fontSize = 12.sp)
                            Text(text = "[${item.warehouseId} - ${item.binLocation}]", color = TextSecondary, fontSize = 11.sp)
                        }
                        Button(
                            onClick = {
                                selectedStockItem = item
                                physicalCount = item.quantity.toString()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = if (isSelected) BluePrimary else DarkSlate800)
                        ) {
                            Text(if (isSelected) "Sélectionné" else "Compter", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        selectedStockItem?.let { item ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSlate900),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(text = "Stock Système Actuel : ${item.quantity} ${item.uom}", color = TextSecondary, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = physicalCount,
                        onValueChange = { physicalCount = it },
                        label = { Text("Comptage Physique Réel") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = reason,
                        onValueChange = { reason = it },
                        label = { Text("Motif de l'ajustement") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            val countNum = physicalCount.toDoubleOrNull()
                            if (countNum != null && countNum >= 0) {
                                viewModel.performInventoryAdjustment(
                                    stockId = item.id,
                                    physicalQuantity = countNum,
                                    reason = reason.ifBlank { "Comptage physique mobile" }
                                )
                                onNavigateBack()
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEC4899))
                    ) {
                        Text("Enregistrer Ajustement Inventaire")
                    }
                }
            }
        }
    }
}
