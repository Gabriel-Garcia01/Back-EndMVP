const fs = require('fs');
const path = require('path');
const jsonPath = path.resolve(__dirname, '..', 'frontend', 'data', 'db.json');

try {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  function normalize(diff) {
    if (!diff) return diff;
    const s = diff.toLowerCase().trim();
    if (s.includes('leve')) return 'Fácil';
    if (s.includes('muito difícil') || s.includes('muito dificil')) return 'Difícil';
    if (s.includes('moderado a difícil') || s.includes('moderado a dificil')) return 'Difícil';
    if (s.includes('fácil a moderado') || s.includes('facil a moderado') || s.includes('fácil a moderado')) return 'Moderado';
    // fallback rules
    if (s.includes('fácil') || s === 'leve') return 'Fácil';
    if (s.includes('moderado')) return 'Moderado';
    if (s.includes('difícil') || s.includes('dificil')) return 'Difícil';
    return diff;
  }

  ['trails', 'waterfalls'].forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item) => {
        if (item && item.difficulty) {
          item.difficulty = normalize(item.difficulty);
        }
      });
    }
  });

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Normalização concluída.');
} catch (err) {
  console.error('Erro ao normalizar:', err);
  process.exit(1);
}
