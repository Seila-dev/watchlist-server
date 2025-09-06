# Backend Node.js

API backend construída com Node.js, Express, Prisma e Cloudflare R2 para gerenciamento de conteúdo e uploads.

## Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Cloudflare R2** - Storage de arquivos
- **Redis** - Cache e filas
- **Jest** - Testes
- **Winston** - Logging

## Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas
├── database/        # Configuração do Prisma
├── middlewares/     # Middlewares customizados
├── queue/           # Configuração do Redis
├── repositories/    # Camada de acesso a dados (futuro)
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio (futuro)
├── storage/         # Configuração do Cloudflare R2
├── utils/           # Utilitários e helpers
└── validators/      # Esquemas de validação

tests/               # Testes automatizados
prisma/              # Esquemas e migrações do banco
```

## Configuração

1. **Clone e instale dependências:**
```bash
npm install
```

2. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Configure o banco de dados:**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Inicie o servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento com hot reload
- `npm start` - Inicia servidor em modo produção
- `npm test` - Executa testes
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Executa testes com cobertura
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas de lint automaticamente

### Scripts do Prisma

- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Aplica migrações
- `npm run prisma:studio` - Abre interface visual do banco
- `npm run prisma:reset` - Reset completo do banco

### Conteúdo
- EM PRODUÇÃO

### Conteúdo
- **title**: obrigatório, 1-255 caracteres
- **category**: MOVIES, SERIES, ANIMES, BOOKS, MANGAS
- **visibility**: PUBLIC, UNLISTED, PRIVATE
- **status**: TO_WATCH, WATCHING, FINISHED
- **rating**: 0-10, máximo 1 casa decimal

### Upload
- **Tipos permitidos**: imagens (JPEG, PNG, GIF, WebP), vídeos (MP4, MPEG, MOV), PDF
- **Tamanho máximo**: 50MB por arquivo
- **Limite**: 5 arquivos por upload múltiplo

## Middleware de Segurança

- **Helmet**: Headers de segurança
- **CORS**: Controle de origem cruzada
- **Rate Limiting**: 100 requests por IP a cada 15 minutos
- **Validação**: Joi para validação de entrada
- **Auth**: Placeholder para integração com Java

## Cache

Redis é usado para:
- Cache de respostas GET (5 minutos padrão)
- Sessões e tokens (futuro)
- Filas de processamento (futuro)

## Logging

Winston configurado com:
- **Desenvolvimento**: Logs coloridos no console com nível debug
- **Produção**: Logs em JSON com rotação de arquivos
- **Métricas**: Tempo de resposta e informações de request

## Testes

### Configuração
- Jest configurado para ES modules
- Mocks automáticos para Prisma, Redis e R2
- Setup global para testes
- Coverage configurado

### Executar
```bash
# Todos os testes
npm test

# Com watch
npm run test:watch

# Com coverage
npm run test:coverage
```

## Cloudflare R2

### Configuração
Configurar as variáveis no `.env`:
```
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=sua-access-key
R2_SECRET_ACCESS_KEY=sua-secret-key
R2_BUCKET=nome-do-bucket
R2_ACCOUNT_ID=seu-account-id
```

### Funcionalidades
- Upload com chaves automáticas
- Organização por pastas (images/, videos/, documents/)
- URLs públicas e assinadas
- Metadados customizados
- Validação de tipo de arquivo

## Autenticação (Futuro)

Preparado para integração com sistema Java:
- Middleware auth configurado
- Validação de token via API Java
- User context nas requests
- Suporte a different roles/permissions

## Deploy

### Docker (Recomendado)
```bash
# Build
docker build -t backend-node .

# Run
docker run -p 3001:3001 --env-file .env backend-node
```

### Variáveis de Ambiente Necessárias
- `DATABASE_URL` - String de conexão PostgreSQL
- `REDIS_URL` - URL do Redis
- `R2_*` - Credenciais do Cloudflare R2

## Monitoramento

### Métricas (EM TESTE)
- Tempo de resposta de requests
- Status de conexões (DB, Redis, R2)
- Uso de memória
- Logs estruturados em JSON

## Contribuição

1. Fork o repositório
2. Crie uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

[MIT License](LICENSE)