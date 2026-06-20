const fs = require('fs');
const path = require('path');

function moveNestedPublic() {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const nested = path.join(publicDir, 'public');

  if (!fs.existsSync(nested)) {
    console.log('Nenhuma pasta public/public encontrada — nada a mover.');
    return;
  }

  try {
    const items = fs.readdirSync(nested);
    if (items.length === 0) {
      fs.rmdirSync(nested);
      console.log('Pasta public/public estava vazia e foi removida.');
      return;
    }

    items.forEach((item) => {
      const src = path.join(nested, item);
      const dest = path.join(publicDir, item);

      if (fs.existsSync(dest)) {
        console.log(`Ignorando ${item} — já existe em public/.`);
        return;
      }

      fs.renameSync(src, dest);
      console.log(`Movido: ${item}`);
    });

    // tentar remover a pasta nested se estiver vazia
    const remaining = fs.readdirSync(nested);
    if (remaining.length === 0) {
      fs.rmdirSync(nested);
      console.log('Pasta public/public removida após mover os arquivos.');
    } else {
      console.log('Alguns arquivos não puderam ser movidos.');
    }
  } catch (err) {
    console.error('Erro ao mover arquivos de public/public:', err.message);
    process.exitCode = 1;
  }
}

moveNestedPublic();
