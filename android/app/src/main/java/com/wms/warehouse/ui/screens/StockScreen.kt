package com.wms.warehouse.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wms.warehouse.data.model.StockItem
import com.wms.warehouse.ui.theme.*
import com.wms.warehouse.ui.viewmodel.WmsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StockScreen(
    viewModel: WmsViewModel,
    onNavigateToScan: () -> Unit,
    onSelectItemForReceipt: (StockItem) -> Unit,
    onSelectItemForIssue: (StockItem) -> Unit,
    onSelectItemForTransfer: (StockItem) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedItemForDetail by remember { mutableStateOf<StockItem?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSlate950)
            .padding(16.dp)
    ) {
        // Search Bar with Scanner Trigger
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.setSearchQuery(it) },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Code, nom, BIN, chinois...", fontSize = 12.sp, color = TextTertiary) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = TextSecondary) },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.setSearchQuery("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", tint = TextSecondary)
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BluePrimary,
                    unfocusedBorderColor = DarkSlate700,
                    focusedContainerColor = DarkSlate900,
                    unfocusedContainerColor = DarkSlate900,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            // Scan Shortcut
            IconButton(
                onClick = onNavigateToScan,
                modifier = Modifier
                    .size(52.dp)
                    .background(BluePrimary, RoundedCornerShape(12.dp))
            ) {
                Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan", tint = TextPrimary)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Warehouse Toggle
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSlate900, RoundedCornerShape(10.dp))
                .padding(3.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            listOf("ALL" to "Tous", "B1" to "B1 (MD01)", "B2" to "B2 (A-E)").forEach { (id, label) ->
                val isSelected = uiState.selectedWarehouse == id
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { viewModel.setSelectedWarehouse(id) },
                    shape = RoundedCornerShape(6.dp),
                    color = if (isSelected) BluePrimary else Color.Transparent
                ) {
                    Text(
                        text = label,
                        modifier = Modifier.padding(vertical = 6.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) TextPrimary else TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Stock count and value summary
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${uiState.stockItems.size} article(s) trouvé(s)",
                fontSize = 11.sp,
                color = TextSecondary
            )
            Text(
                text = "$${"%,.2f".format(uiState.stockItems.sumOf { it.totalValue })}",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFF10B981)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Stock Items List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(uiState.stockItems) { item ->
                StockItemCard(
                    item = item,
                    onClick = { selectedItemForDetail = item }
                )
            }
        }
    }

    // Detail Bottom Sheet
    selectedItemForDetail?.let { item ->
        ModalBottomSheet(
            onDismissRequest = { selectedItemForDetail = null },
            containerColor = DarkSlate900,
            contentColor = TextPrimary
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.materialCode,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = BlueLight
                        )
                        Text(
                            text = item.materialName,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )
                        item.chineseName?.let {
                            Text(text = it, fontSize = 12.sp, color = TextSecondary)
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (item.warehouseId == "B1") Color(0xFF1E3A8A) else Color(0xFF064E3B)
                    ) {
                        Text(
                            text = item.warehouseId,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Stats row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkSlate950, RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Emplacement", fontSize = 11.sp, color = TextTertiary)
                        Text(
                            text = item.binLocation,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = TextPrimary
                        )
                    }
                    Column {
                        Text(text = "Disponible", fontSize = 11.sp, color = TextTertiary)
                        Text(
                            text = "${item.availableQuantity} ${item.uom}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF22C55E)
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "Prix Unitaire", fontSize = 11.sp, color = TextTertiary)
                        Text(
                            text = "$${"%.2f".format(item.unitPrice)}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = TextPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Quick Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            selectedItemForDetail = null
                            onSelectItemForReceipt(item)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                    ) {
                        Icon(Icons.Default.ArrowDownward, contentDescription = "Entrée", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Entrée", fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            selectedItemForDetail = null
                            onSelectItemForIssue(item)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                    ) {
                        Icon(Icons.Default.ArrowUpward, contentDescription = "Sortie", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Sortie", fontSize = 12.sp)
                    }

                    Button(
                        onClick = {
                            selectedItemForDetail = null
                            onSelectItemForTransfer(item)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                    ) {
                        Icon(Icons.Default.SwapHoriz, contentDescription = "Transfert", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Transfert", fontSize = 12.sp)
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun StockItemCard(
    item: StockItem,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = DarkSlate900),
        shape = RoundedCornerShape(12.dp),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = item.materialCode,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = BlueLight
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = if (item.warehouseId == "B1") Color(0xFF1E3A8A) else Color(0xFF064E3B)
                    ) {
                        Text(
                            text = item.warehouseId,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = DarkSlate950
                ) {
                    Text(
                        text = item.binLocation,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        fontFamily = FontFamily.Monospace,
                        color = TextSecondary,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Text(
                text = item.materialName,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary,
                maxLines = 1,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "$${"%.2f".format(item.unitPrice)} / ${item.uom}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = TextTertiary
                )

                Text(
                    text = "${item.availableQuantity} ${item.uom}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = if (item.availableQuantity <= 5) Color(0xFFF59E0B) else Color(0xFF22C55E)
                )
            }
        }
    }
}
