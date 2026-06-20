const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '..', 'frontend', 'data', 'db.json');
try {
  const text = fs.readFileSync(filePath, 'utf8');
  const first = text.indexOf('"parks": [');
  const second = text.indexOf('"parks": [', first + 1);
  if (second === -1) {
    console.log('Nenhuma duplicação encontrada.');
    process.exit(0);
  }
  // find the opening brace '{' before the second occurrence
  const braceIndex = text.lastIndexOf('{', second);
  if (braceIndex === -1) {
    console.error('Não foi possível localizar início do bloco duplicado.');
    process.exit(1);
  }
  const newText = text.slice(braceIndex);
  // quick check: should start with '{' and contain "trails" and "waterfalls"
  if (!newText.trim().startsWith('{') || newText.indexOf('"trails":') === -1) {
    console.error('Bloco extraído não parece válido. Abortando.');
    process.exit(1);
  }
  fs.writeFileSync(filePath, newText, 'utf8');
  console.log('Arquivo reparado: duplicação removida.');
} catch (err) {
  console.error('Erro durante reparo:', err);
  process.exit(1);
}
