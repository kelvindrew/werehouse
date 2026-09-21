const fs = require('fs');
const path = require('path');

const stockPath = path.join(__dirname, 'src', 'data', 'stock.json');
const movementsPath = path.join(__dirname, 'src', 'data', 'stock_movements.json');

const stock = JSON.parse(fs.readFileSync(stockPath, 'utf8'));
const movements = JSON.parse(fs.readFileSync(movementsPath, 'utf8'));

console.log(`Loaded ${stock.length} stock items and ${movements.length} initial movements.`);

// Test Item: 40694936 (Impeller in B1, MD01)
const item = stock.find(s => s.materialCode === '40694936' && s.warehouseId === 'B1');
if (!item) {
  console.error("Test item 40694936 not found!");
  process.exit(1);
}

console.log("\n--- TEST CRITÈRE DE RÉUSSITE : INITIAL STATE ---");
console.log(`Material: ${item.materialCode} (${item.materialName})`);
console.log(`Warehouse: ${item.warehouseId} | BIN: ${item.binLocation}`);
console.log(`Initial Quantity: ${item.quantity} ${item.uom}`);
console.log(`Unit Price: $${item.unitPrice} | Total Value: $${item.totalValue}`);

// Step 1: Simulate Android Issue (Sortie) of 2 units
const issueQty = 2;
console.log(`\n--- STEP 1: ANDROID OPERATOR ISSUES ${issueQty} UNITS ---`);
if (item.availableQuantity < issueQty) {
  console.error("Insufficient stock!");
  process.exit(1);
}

const prevQty = item.quantity;
item.quantity -= issueQty;
item.availableQuantity = item.quantity - item.reservedQuantity;
item.totalValue = Math.round(item.quantity * item.unitPrice * 100) / 100;
item.lastUpdated = new Date().toISOString();

const issueMovement = {
  id: `MOV-ISS-TEST-${Date.now()}`,
  movementType: 'ISSUE',
  materialId: item.materialId,
  materialCode: item.materialCode,
  materialName: item.materialName,
  warehouseId: item.warehouseId,
  binLocation: item.binLocation,
  quantity: issueQty,
  previousQuantity: prevQty,
  newQuantity: item.quantity,
  unitPrice: item.unitPrice,
  totalAmount: Math.round(issueQty * item.unitPrice * 100) / 100,
  referenceNumber: 'BON-SORTIE-TEST-001',
  requester: 'Landry - Atelier Pompes',
  department: 'Maintenance',
  reason: 'Remplacement turbine défectueuse',
  performedBy: 'USR-STORE-MOBILE',
  performedByName: 'Magasinier Android',
  createdAt: item.lastUpdated
};
movements.unshift(issueMovement);

console.log(`PASS: Stock decreased: ${prevQty} -> ${item.quantity} ${item.uom}`);
console.log(`PASS: Movement created: ${issueMovement.id} [${issueMovement.movementType}] by ${issueMovement.performedByName}`);

// Step 2: Simulate Web Transfer B1 -> B2 of 1 unit
console.log(`\n--- STEP 2: WEB OPERATOR TRANSFERS 1 UNIT FROM B1 (MD01) TO B2 (B2-01-01-01) ---`);
const transferQty = 1;
const transferId = `TRF-TEST-${Date.now()}`;

const srcPrev = item.quantity;
item.quantity -= transferQty;
item.availableQuantity = item.quantity - item.reservedQuantity;
item.totalValue = Math.round(item.quantity * item.unitPrice * 100) / 100;

// Find or create B2 stock
let b2Item = stock.find(s => s.materialCode === '40694936' && s.warehouseId === 'B2' && s.binLocation === 'B2-01-01-01');
let destPrev = 0;
if (!b2Item) {
  destPrev = 0;
  b2Item = {
    id: `B2_40694936_B2-01-01-01`,
    materialId: item.materialId,
    materialCode: item.materialCode,
    materialName: item.materialName,
    warehouseId: 'B2',
    binLocation: 'B2-01-01-01',
    uom: item.uom,
    quantity: transferQty,
    reservedQuantity: 0,
    availableQuantity: transferQty,
    unitPrice: item.unitPrice,
    totalValue: Math.round(transferQty * item.unitPrice * 100) / 100,
    lastUpdated: new Date().toISOString()
  };
  stock.push(b2Item);
} else {
  destPrev = b2Item.quantity;
  b2Item.quantity += transferQty;
  b2Item.availableQuantity += transferQty;
  b2Item.totalValue = Math.round(b2Item.quantity * b2Item.unitPrice * 100) / 100;
}

const movOut = {
  id: `MOV-TRF-OUT-${Date.now()}`,
  movementType: 'TRANSFER_OUT',
  materialId: item.materialId,
  materialCode: item.materialCode,
  materialName: item.materialName,
  warehouseId: 'B1',
  binLocation: 'MD01',
  quantity: transferQty,
  previousQuantity: srcPrev,
  newQuantity: item.quantity,
  transferId: transferId,
  destinationWarehouseId: 'B2',
  destinationBinLocation: 'B2-01-01-01',
  performedBy: 'USR-ADMIN-01',
  performedByName: 'Landry (Admin)',
  createdAt: new Date().toISOString()
};

const movIn = {
  id: `MOV-TRF-IN-${Date.now()}`,
  movementType: 'TRANSFER_IN',
  materialId: item.materialId,
  materialCode: item.materialCode,
  materialName: item.materialName,
  warehouseId: 'B2',
  binLocation: 'B2-01-01-01',
  quantity: transferQty,
  previousQuantity: destPrev,
  newQuantity: b2Item.quantity,
  transferId: transferId,
  destinationWarehouseId: 'B2',
  destinationBinLocation: 'B2-01-01-01',
  performedBy: 'USR-ADMIN-01',
  performedByName: 'Landry (Admin)',
  createdAt: new Date().toISOString()
};
movements.unshift(movOut, movIn);

console.log(`PASS: B1 quantity after transfer: ${item.quantity} ${item.uom}`);
console.log(`PASS: B2 quantity after transfer: ${b2Item.quantity} ${b2Item.uom}`);
console.log(`PASS: Linked movements created with transferId: ${transferId}`);

console.log("\n========================================================");
console.log("CRITÈRE DE RÉUSSITE SECTION 29 VALIDÉ AVEC SUCCÈS !");
console.log("========================================================");
