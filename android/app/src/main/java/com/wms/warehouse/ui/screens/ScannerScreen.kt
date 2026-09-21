package com.wms.warehouse.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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

@Composable
fun ScannerScreen(
    viewModel: WmsViewModel,
    onNavigateBack: () -> Unit,
    onSelectItemForReceipt: (StockItem) -> Unit,
    onSelectItemForIssue: (StockItem) -> Unit,
    onSelectItemForTransfer: (StockItem) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var manualBarcode by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Simulated Camera Viewfinder & Frame
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top overlay bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Retour", tint = TextPrimary)
                }
                Text(
                    text = "Scanner Code-Barres / QR",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                IconButton(onClick = { /* Flashlight toggle */ }) {
                    Icon(Icons.Default.FlashlightOn, contentDescription = "Flash", tint = TextPrimary)
                }
            }

            // Center Viewfinder Targeting Box
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .align(Alignment.CenterHorizontally)
                    .border(2.dp, BluePrimary, RoundedCornerShape(16.dp))
                    .background(Color.Transparent),
                contentAlignment = Alignment.Center
            ) {
                // Targeting crosshair
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .height(2.dp)
                        .background(Color.Red.copy(alpha = 0.8f))
                )
            }

            // Bottom Manual Entry / Scanned Item Action Panel
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkSlate900.copy(alpha = 0.95f))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // If an item was identified
                uiState.scannedItem?.let { item ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = DarkSlate950),
                        shape = RoundedCornerShape(12.dp),
                        border = CardDefaults.outlinedCardBorder()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = item.materialCode,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = BlueLight
                                )
                                Text(
                                    text = "[${item.warehouseId} - ${item.binLocation}]",
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    color = TextSecondary
                                )
                            }
                            Text(
                                text = item.materialName,
                                fontSize = 12.sp,
                                color = TextPrimary,
                                maxLines = 1
                            )
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Disponible: ${item.availableQuantity} ${item.uom}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF22C55E)
                                )
                                Text(
                                    text = "$${item.unitPrice} USD",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }
                    }

                    // Direct Operations Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { onSelectItemForReceipt(item) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                        ) {
                            Text("Entrée", fontSize = 11.sp)
                        }
                        Button(
                            onClick = { onSelectItemForIssue(item) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AmberIssue)
                        ) {
                            Text("Sortie", fontSize = 11.sp)
                        }
                        Button(
                            onClick = { onSelectItemForTransfer(item) },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoTransfer)
                        ) {
                            Text("Transfert", fontSize = 11.sp)
                        }
                    }
                } ?: run {
                    // Manual Barcode Input Fallback
                    Text(
                        text = "Saisie manuelle ou simulation de scan :",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = manualBarcode,
                            onValueChange = { manualBarcode = it },
                            modifier = Modifier.weight(1f),
                            placeholder = { Text("ex: 40694936 ou MD01", fontSize = 12.sp, color = TextTertiary) },
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                focusedBorderColor = BluePrimary
                            )
                        )
                        Button(
                            onClick = {
                                if (manualBarcode.isNotEmpty()) {
                                    viewModel.onBarcodeScanned(manualBarcode)
                                }
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                        ) {
                            Text("Identifier")
                        }
                    }
                }
            }
        }
    }
}
