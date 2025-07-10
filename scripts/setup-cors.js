const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Caminho para o arquivo cors.json
const corsConfigPath = path.join(__dirname, '..', 'cors.json');

// Verifica se o arquivo existe
if (!fs.existsSync(corsConfigPath)) {
  console.error('❌ Arquivo cors.json não encontrado!');
  process.exit(1);
}

// Removidos todos os console.log()

try {
  // Substitua pelo nome do seu bucket
  const bucketName = 'ibmec-jr-solucoes.appspot.com';
  
  // Executa o comando gsutil para definir as regras CORS
  const command = `npx firebase-tools storage:cors set ${corsConfigPath} --project ibmec-jr-solucoes`;
  
  // Removidos todos os console.log()
  execSync(command, { stdio: 'inherit' });
  
  // Removidos todos os console.log()
} catch (error) {
  console.error('❌ Erro ao configurar regras CORS:', error.message);
  console.log('\n📋 Para configurar manualmente:');
  console.log('1. Instale o Firebase CLI: npm install -g firebase-tools');
  console.log('2. Faça login: firebase login');
  console.log('3. Execute: firebase storage:cors set cors.json --project ibmec-jr-solucoes');
}
