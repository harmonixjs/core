const { existsSync } = require('fs');
const { join } = require('path');

const projectRoot = process.cwd();

// Ne pas afficher le message si on est dans le node_modules du package lui-même
if (projectRoot.includes('node_modules/@harmonixjs/core')) {
  process.exit(0);
}

const tsconfigPath = join(projectRoot, 'tsconfig.json');

if (!existsSync(tsconfigPath)) {
  console.log('\n⚠️  TypeScript configuration not found!\n');
  console.log('📝 Create a tsconfig.json file:\n');
  console.log('   npx tsc --init\n');
  console.log('🔧 Required options:');
  console.log('   - experimentalDecorators: true');
  console.log('   - emitDecoratorMetadata: true\n');
} else {
  console.log('✅ TypeScript configuration found\n');
}