package com.wms.warehouse

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wms.warehouse.data.local.WmsDatabase
import com.wms.warehouse.data.model.StockItem
import com.wms.warehouse.data.repository.WmsRepository
import com.wms.warehouse.ui.screens.*
import com.wms.warehouse.ui.theme.DarkSlate900
import com.wms.warehouse.ui.theme.DarkSlate950
import com.wms.warehouse.ui.theme.WmsTheme
import com.wms.warehouse.ui.viewmodel.WmsViewModel

enum class Screen {
    HOME,
    STOCK,
    SCANNER,
    RECEIPT,
    ISSUE,
    TRANSFER,
    INVENTORY
}

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = WmsDatabase.getInstance(applicationContext)
        val repository = WmsRepository(database.wmsDao())
        val viewModel = WmsViewModel(repository)

        setContent {
            WmsTheme {
                var currentScreen by remember { mutableStateOf(Screen.HOME) }
                var selectedItemForOperation by remember { mutableStateOf<StockItem?>(null) }
                val uiState by viewModel.uiState.collectAsState()

                // Show toast when user message is emitted
                LaunchedEffect(uiState.userMessage, uiState.errorMessage) {
                    uiState.userMessage?.let {
                        Toast.makeText(this@MainActivity, it, Toast.LENGTH_SHORT).show()
                        viewModel.clearMessages()
                    }
                    uiState.errorMessage?.let {
                        Toast.makeText(this@MainActivity, "Erreur: $it", Toast.LENGTH_LONG).show()
                        viewModel.clearMessages()
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = DarkSlate950,
                    bottomBar = {
                        NavigationBar(
                            containerColor = DarkSlate900,
                            tonalElevation = 8.dp
                        ) {
                            NavigationBarItem(
                                selected = currentScreen == Screen.HOME,
                                onClick = { currentScreen = Screen.HOME },
                                icon = { Icon(Icons.Default.Home, contentDescription = "Accueil") },
                                label = { Text("Hub", fontSize = 11.sp) }
                            )
                            NavigationBarItem(
                                selected = currentScreen == Screen.STOCK,
                                onClick = { currentScreen = Screen.STOCK },
                                icon = { Icon(Icons.Default.Inventory2, contentDescription = "Stock") },
                                label = { Text("Stock", fontSize = 11.sp) }
                            )
                            NavigationBarItem(
                                selected = currentScreen == Screen.SCANNER,
                                onClick = { currentScreen = Screen.SCANNER },
                                icon = { Icon(Icons.Default.QrCodeScanner, contentDescription = "Scanner") },
                                label = { Text("Scanner", fontSize = 11.sp) }
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (currentScreen) {
                            Screen.HOME -> HomeScreen(
                                viewModel = viewModel,
                                onNavigateToScan = { currentScreen = Screen.SCANNER },
                                onNavigateToStock = { currentScreen = Screen.STOCK },
                                onNavigateToReceipt = {
                                    selectedItemForOperation = null
                                    currentScreen = Screen.RECEIPT
                                },
                                onNavigateToIssue = {
                                    selectedItemForOperation = null
                                    currentScreen = Screen.ISSUE
                                },
                                onNavigateToTransfer = {
                                    selectedItemForOperation = null
                                    currentScreen = Screen.TRANSFER
                                },
                                onNavigateToInventory = { currentScreen = Screen.INVENTORY }
                            )

                            Screen.STOCK -> StockScreen(
                                viewModel = viewModel,
                                onNavigateToScan = { currentScreen = Screen.SCANNER },
                                onSelectItemForReceipt = { item ->
                                    selectedItemForOperation = item
                                    currentScreen = Screen.RECEIPT
                                },
                                onSelectItemForIssue = { item ->
                                    selectedItemForOperation = item
                                    currentScreen = Screen.ISSUE
                                },
                                onSelectItemForTransfer = { item ->
                                    selectedItemForOperation = item
                                    currentScreen = Screen.TRANSFER
                                }
                            )

                            Screen.SCANNER -> ScannerScreen(
                                viewModel = viewModel,
                                onNavigateBack = { currentScreen = Screen.HOME },
                                onSelectItemForReceipt = { item ->
                                    selectedItemForOperation = item
                                    currentScreen = Screen.RECEIPT
                                },
                                onSelectItemForIssue = { item ->
                                    selectedItemForOperation = item
                                    currentScreen = Screen.ISSUE
                                },
                                onSelectItemForTransfer = { item ->
                                    selectedItemForOperation = item
                                    currentScreen = Screen.TRANSFER
                                }
                            )

                            Screen.RECEIPT -> ReceiptScreen(
                                viewModel = viewModel,
                                initialItem = selectedItemForOperation,
                                onNavigateBack = { currentScreen = Screen.HOME }
                            )

                            Screen.ISSUE -> IssueScreen(
                                viewModel = viewModel,
                                initialItem = selectedItemForOperation,
                                onNavigateBack = { currentScreen = Screen.HOME }
                            )

                            Screen.TRANSFER -> TransferScreen(
                                viewModel = viewModel,
                                initialItem = selectedItemForOperation,
                                onNavigateBack = { currentScreen = Screen.HOME }
                            )

                            Screen.INVENTORY -> InventoryScreen(
                                viewModel = viewModel,
                                onNavigateBack = { currentScreen = Screen.HOME }
                            )
                        }
                    }
                }
            }
        }
    }
}
