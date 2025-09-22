// scripts/setupAlgolia.js
// Script para configurar o índice do Algolia com as configurações recomendadas

import algolia from '../utils/Algolia.js';

async function setupAlgoliaIndex() {
  if (!algolia.enabled) {
    console.error('❌ Algolia não está configurado. Verifique as variáveis de ambiente:');
    console.error('   - ALGOLIA_APP_ID');
    console.error('   - ALGOLIA_ADMIN_KEY'); 
    console.error('   - ALGOLIA_INDEX_NAME (opcional)');
    process.exit(1);
  }

  try {
    console.log(`🔧 Configurando índice Algolia: ${algolia.indexName}`);

    // Configurações recomendadas para busca de conteúdo
    const indexSettings = {
      // Atributos pesquisáveis (em ordem de importância)
      searchableAttributes: [
        'title',
        'description',
        'tags',
        'category'
      ],

      // Atributos para facetas/filtros
      attributesForFaceting: [
        'category',
        'tags',
        'visibility',
        'ownerId'
      ],

      // Ranking customizado (critérios de relevância)
      customRanking: [
        'desc(createdAt)', // Mais recentes primeiro
        'asc(title)'       // Ordem alfabética como critério secundário
      ],

      // Configurações de busca
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8,

      // Paginação padrão
      hitsPerPage: 20,

      // Atributos a serem destacados nos resultados
      attributesToHighlight: [
        'title',
        'description'
      ],

      // Atributos para snippet (prévia do texto)
      attributesToSnippet: [
        'description:20'
      ],

      // Separadores para tokenização
      separatorsToIndex: '!@#$%^&*()_+-=[]{}|;:,.<>?',

      // Configurações de sinônimos (você pode expandir isso)
      synonyms: [],

      // Configurações opcionais para melhorar a experiência
      removeWordsIfNoResults: 'lastWords',
      advancedSyntax: false,
      optionalWords: [],

      // Configurações de geo-busca (se aplicável)
      // ignorePlurals: ['pt'],
    };

    // Aplicar as configurações
    const success = await algolia.setSettings(indexSettings);

    if (success) {
      console.log('✅ Configurações do índice aplicadas com sucesso!');
      
      // Verificar se as configurações foram aplicadas
      const currentSettings = await algolia.getSettings();
      console.log('📋 Configurações atuais:');
      console.log('   - Atributos pesquisáveis:', currentSettings?.searchableAttributes || 'Não definido');
      console.log('   - Facetas:', currentSettings?.attributesForFaceting || 'Não definido');
      console.log('   - Ranking customizado:', currentSettings?.customRanking || 'Não definido');
      
    } else {
      console.error('❌ Erro ao aplicar configurações do índice');
      process.exit(1);
    }

    // Testar conexão
    console.log('\n🧪 Testando conexão...');
    const connectionTest = await algolia.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Teste de conexão bem-sucedido!');
    } else {
      console.error('❌ Erro no teste de conexão:', connectionTest.message);
    }

    console.log('\n🎉 Setup do Algolia concluído!');
    console.log('\n📌 Próximos passos:');
    console.log('   1. Execute a reindexação do conteúdo existente');
    console.log('   2. Teste as buscas através do endpoint /algolia/test');
    console.log('   3. Monitore os logs para verificar a indexação de novos conteúdos');

  } catch (error) {
    console.error('❌ Erro durante o setup do Algolia:', error);
    console.error('Detalhes:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAlgoliaIndex()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export default setupAlgoliaIndex;