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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wms.warehouse.ui.theme.*
import com.wms.warehouse.ui.viewmodel.WmsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: WmsViewModel,
    onNavigateToScan: () -> Unit,
    onNavigateToStock: () -> Unit,
    onNavigateToReceipt: () -> Unit,
    onNavigateToIssue: () -> Unit,
    onNavigateToTransfer: () -> Unit,
    onNavigateToInventory: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    val totalQty = uiState.stockItems.sumOf { it.quantity }
    val totalVal = uiState.stockItems.sumOf { it.totalValue }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkSlate950)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Warehouse Hub",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Opérations B1 & B2 • Magasinier",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }

                // Status chip
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = DarkSlate900,
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color(0xFF22C55E))
                        )
                        Text(
                            text = "En ligne",
                            fontSize = 11.sp,
                            color = TextSecondary,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }

        // Warehouse Selector Filter
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkSlate900, RoundedCornerShape(12.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf("ALL" to "Tous (B1+B2)", "B1" to "B1 (MD01)", "B2" to "B2 (Zones A-E)").forEach { (id, label) ->
                    val isSelected = uiState.selectedWarehouse == id
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { viewModel.setSelectedWarehouse(id) },
                        shape = RoundedCornerShape(8.dp),
                        color = if (isSelected) BluePrimary else Color.Transparent
                    ) {
                        Text(
                            text = label,
                            modifier = Modifier.padding(vertical = 8.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) TextPrimary else TextSecondary
                        )
                    }
                }
            }
        }

        // KPI Overview Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkSlate900),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "VALEUR TOTALE DU STOCK SÉLECTIONNÉ",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextTertiary
                    )
                    Text(
                        text = "$${"%,.2f".format(totalVal)}",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = TextPrimary,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    Divider(color = DarkSlate800, modifier = Modifier.padding(vertical = 8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${uiState.stockItems.size} emplacements",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Text(
                            text = "${"%,.0f".format(totalQty)} unités physiques",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF10B981)
                        )
                    }
                }
            }
        }

        // Quick Single-Hand Action Grid (Big Touch Targets)
        item {
            Text(
                text = "ACTIONS RAPIDES",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextTertiary,
                modifier = Modifier.padding(bottom = 4.dp)
            )

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                // Primary Big Action: SCAN
                Button(
                    onClick = onNavigateToScan,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCodeScanner,
                        contentDescription = "Scanner",
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(horizontalAlignment = Alignment.Start) {
                        Text(
                            text = "SCANNER CODE-BARRES / QR",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Recherche et actions instantanées",
                            fontSize = 11.sp,
                            color = TextPrimary.copy(alpha = 0.8f)
                        )
                    }
                }

                // Grid of 4 operations
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ActionCard(
                        title = "Entrée",
                        subtitle = "Réception",
                        icon = Icons.Default.ArrowDownward,
                        color = Color(0xFF3B82F6),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToReceipt
                    )
                    ActionCard(
                        title = "Sortie",
                        subtitle = "Bon de sortie",
                        icon = Icons.Default.ArrowUpward,
                        color = Color(0xFFF59E0B),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToIssue
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ActionCard(
                        title = "Transfert",
                        subtitle = "B1 ↔ B2",
                        icon = Icons.Default.SwapHoriz,
                        color = Color(0xFF6366F1),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToTransfer
                    )
                    ActionCard(
                        title = "Inventaire",
                        subtitle = "Comptage physique",
                        icon = Icons.Default.Checklist,
                        color = Color(0xFFEC4899),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToInventory
                    )
                }
            }
        }

        // Recent Activity Feed
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "DERNIERS MOUVEMENTS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextTertiary
                )
                Text(
                    text = "${uiState.recentMovements.size} récents",
                    fontSize = 11.sp,
                    color = BlueLight
                )
            }
        }

        items(uiState.recentMovements.take(6)) { movement ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DarkSlate900),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (movement.movementType.name.startsWith("RECEIPT") || movement.movementType.name.startsWith("TRANSFER_IN"))
                                    Color(0xFF1E3A8A) else Color(0xFF78350F)
                            ) {
                                Text(
                                    text = movement.movementType.name,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "[${movement.warehouseId} - ${movement.binLocation}]",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = TextSecondary
                            )
                        }
                        Text(
                            text = movement.materialName,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary,
                            maxLines = 1,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        val isPlus = movement.movementType.name.startsWith("RECEIPT") || movement.movementType.name.startsWith("TRANSFER_IN")
                        Text(
                            text = "${if (isPlus) "+" else "-"}${movement.quantity}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = if (isPlus) Color(0xFF22C55E) else Color(0xFFF59E0B)
                        )
                        Text(
                            text = movement.referenceNumber ?: "N/A",
                            fontSize = 10.sp,
                            color = TextTertiary
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ActionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(72.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSlate900),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = color,
                    modifier = Modifier.size(22.dp)
                )
            }
            Column {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = subtitle,
                    fontSize = 10.sp,
                    color = TextSecondary
                )
            }
        }
    }
}
