# Documentação do Produto 214K

## 1. Contextualização do problema

O produto 214K é uma plataforma de comércio eletrônico para navegação de produtos, autenticação de usuários, carrinho de compras e finalização de pedidos. A primeira versão do sistema existia como uma aplicação web React com React Router e armazenamento em `localStorage`. Essa versão foi mantida em `backup/` como referência histórica.

A evolução atual migra a experiência para Expo/React Native, mantendo suporte web e acrescentando compatibilidade com Android e iOS. A migração também exigiu a adaptação de:

- Rotas web para rotas baseadas em arquivos com Expo Router.
- Elementos HTML para componentes React Native.
- `localStorage` para AsyncStorage.
- Upload de imagens por URL para seleção de arquivos e armazenamento no backend.
- Menu lateral web para Drawer responsivo.
- Estilos fixos para uma arquitetura global de temas claro/escuro.

O backend ativo fica em `.backend/`, utiliza Express e MySQL/MariaDB, e é consumido pelo aplicativo por meio da API HTTP autenticada com JWT.

## 2. Evolução do produto

### Fase 1: Aplicação web de referência

A aplicação original oferecia:

- Cadastro e login.
- Catálogo e busca por categorias.
- Detalhes de produto.
- Carrinho e checkout.
- Dashboard do usuário.
- Operações administrativas sobre produtos.

### Fase 2: Migração para Expo

A aplicação passou a utilizar:

- Expo SDK 57.
- Expo Router.
- React Native Web.
- AsyncStorage para token e preferências locais.
- Drawer autenticado, exibindo somente as opções permitidas.
- Componentes nativos para formulários, cartões e navegação.

### Fase 3: Funcionalidades administrativas

Foram acrescentados:

- Seleção e criação de categorias.
- Busca de produtos por nome, descrição e categoria.
- Paginação da listagem administrativa.
- Edição e exclusão lógica de produtos.
- Upload de imagens com Multer.
- Validação de tamanho, MIME type e assinatura binária.
- Reutilização de imagens duplicadas por hash SHA-256.

### Fase 4: Padronização visual e acessibilidade de uso

A interface passou a possuir:

- Tema claro e escuro persistido.
- Tokens semânticos de cor.
- Header, footer e Drawer padronizados.
- Componentes de painel, cartões, inputs e botões reutilizáveis.
- Toasts para sucesso e erro em operações relevantes.

## 3. Arquitetura atual

```mermaid
flowchart LR
    U[Usuário] --> E[Expo / React Native]
    E --> R[Expo Router]
    R --> C[Componentes e Contextos]
    C --> S[Services / API Client]
    S -->|HTTP + JWT| B[Express Backend]
    B --> M[Middleware de autenticação]
    B --> CT[Controllers]
    CT --> DB[(MySQL / MariaDB)]
    B --> FS[(uploads/)]
```

### Camadas

| Camada | Responsabilidade |
|---|---|
| `src/app` | Rotas e composição das telas Expo Router. |
| `src/components` | Componentes visuais reutilizáveis e painéis. |
| `src/context` | Estado global de carrinho e tema. |
| `src/services` | Comunicação com a API, autenticação e operações de domínio. |
| `src/constants` | Tokens de tema, fontes e espaçamentos. |
| `.backend/routes` | Definição dos endpoints HTTP. |
| `.backend/controllers` | Regras de negócio e acesso aos dados. |
| `.backend/middleware` | Autenticação JWT e upload Multer. |
| `.backend/Script.sql` | Modelo relacional do banco. |

## 4. Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : administra
    USERS ||--o{ ADDRESSES : possui
    USERS ||--o{ CREDIT_CARDS : possui
    USERS ||--o{ ORDERS : realiza
    USERS ||--o{ CART : possui
    PRODUCTS ||--o{ CART : aparece_em
    PRODUCTS ||--o{ ORDER_ITEMS : compoe
    PRODUCTS ||--o{ PRODUCT_CATEGORIES : classifica
    CATEGORIES ||--o{ PRODUCT_CATEGORIES : agrupa
    ORDERS ||--o{ ORDER_ITEMS : contem

    USERS {
        bigint id PK
        varchar name
        varchar email UK
        char cpf UK
        boolean is_admin
        boolean is_deleted
    }
    CATEGORIES {
        bigint id PK
        varchar name
        text description
        boolean is_deleted
    }
    PRODUCTS {
        bigint id PK
        bigint admin_id FK
        varchar name
        text description
        decimal price
        varchar image_url
        boolean is_deleted
    }
    PRODUCT_CATEGORIES {
        bigint product_id PK,FK
        bigint category_id PK,FK
    }
    ADDRESSES {
        bigint id PK
        bigint user_id FK
        varchar country
        varchar state
        varchar city
        varchar street
        varchar number
        varchar postal_code
        boolean is_favorite
    }
    CREDIT_CARDS {
        bigint id PK
        bigint user_id FK
        varchar card_number
        varchar security_code
        date expiration_date
        boolean is_favorite
    }
    ORDERS {
        bigint id PK
        bigint user_id FK
        decimal total
        varchar status
        boolean is_deleted
    }
    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        decimal price
    }
    CART {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        int quantity
    }
```

## 5. Requisitos funcionais

| Código | Requisito |
|---|---|
| RF01 | O sistema deve permitir o cadastro de usuários com nome, e-mail, senha e CPF. |
| RF02 | O sistema deve permitir login por e-mail ou nome e emitir um token JWT. |
| RF03 | O sistema deve manter a sessão localmente usando AsyncStorage. |
| RF04 | O sistema deve exibir produtos ativos e seus detalhes. |
| RF05 | O sistema deve permitir busca por nome, descrição e categoria. |
| RF06 | O sistema deve permitir filtragem por categoria. |
| RF07 | O usuário autenticado deve poder adicionar, alterar quantidade e remover itens do carrinho. |
| RF08 | O usuário autenticado deve poder finalizar um pedido. |
| RF09 | O sistema deve exigir endereço e forma de pagamento antes do checkout. |
| RF10 | O usuário deve visualizar seu histórico de pedidos. |
| RF11 | O usuário deve poder atualizar seus dados cadastrais e senha. |
| RF12 | O usuário deve poder cadastrar, editar, favoritar e excluir endereços. |
| RF13 | O usuário deve poder cadastrar, favoritar e excluir cartões. |
| RF14 | O administrador deve criar, editar e excluir logicamente produtos. |
| RF15 | O administrador deve selecionar uma categoria existente ou criar uma nova. |
| RF16 | O administrador deve pesquisar e paginar produtos no painel administrativo. |
| RF17 | O sistema deve permitir seleção de imagem no dispositivo ou navegador. |
| RF18 | O backend deve validar imagens e reaproveitar arquivos duplicados. |
| RF19 | O usuário deve alternar entre tema claro e escuro. |
| RF20 | O sistema deve exibir notificações de sucesso e erro nas operações principais. |

## 6. Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | A aplicação deve funcionar em Android, iOS e Web por meio do Expo. |
| RNF02 | A API deve utilizar JSON e autenticação JWT para recursos protegidos. |
| RNF03 | Senhas não devem ser armazenadas em texto puro; o backend utiliza hash com bcrypt. |
| RNF04 | O CORS deve permitir a comunicação entre o cliente Expo e o backend durante o desenvolvimento. |
| RNF05 | Uploads devem aceitar somente imagens suportadas e limitar o tamanho a 10 MB. |
| RNF06 | Imagens devem ser identificadas pela assinatura binária, não apenas pelo nome do arquivo. |
| RNF07 | Imagens idênticas devem ser reutilizadas por hash SHA-256, evitando duplicação física. |
| RNF08 | Produtos, usuários e demais registros devem possuir exclusão lógica quando aplicável. |
| RNF09 | A interface deve possuir componentes reutilizáveis e tokens de tema centralizados. |
| RNF10 | A preferência de tema deve persistir entre sessões. |
| RNF11 | A aplicação deve informar estados de carregamento, vazio e erro. |
| RNF12 | O código deve manter separação entre telas, componentes, contexto, serviços e backend. |
| RNF13 | A API deve retornar códigos HTTP coerentes e mensagens de erro legíveis. |
| RNF14 | O sistema deve evitar exposição de rotas administrativas para usuários não autenticados. |

## 7. Diagramas de casos de uso

### 7.1 Casos de uso do cliente

```mermaid
flowchart LR
    Cliente((Cliente))
    Visitante((Visitante))
    Auth[Autenticar-se]
    Catalogo[Consultar catálogo]
    Buscar[Buscar e filtrar produtos]
    Detalhe[Consultar detalhe do produto]
    Carrinho[Gerenciar carrinho]
    Checkout[Finalizar pedido]
    Historico[Consultar pedidos]
    Perfil[Gerenciar perfil]

    Visitante --> Catalogo
    Visitante --> Buscar
    Visitante --> Detalhe
    Cliente --> Auth
    Cliente --> Carrinho
    Cliente --> Checkout
    Cliente --> Historico
    Cliente --> Perfil
    Checkout -. exige .-> Auth
```

### 7.2 Casos de uso administrativo

```mermaid
flowchart LR
    Admin((Administrador))
    Autenticacao[Validar sessão e perfil admin]
    Produtos[Gerenciar produtos]
    Categorias[Gerenciar categorias]
    Imagens[Enviar e validar imagens]
    Busca[Pesquisar produtos]
    Paginacao[Paginar resultados]
    Admin --> Autenticacao
    Admin --> Produtos
    Admin --> Categorias
    Admin --> Imagens
    Produtos --> Busca
    Produtos --> Paginacao
    Imagens -. inclui .-> Produtos
    Categorias -. apoia .-> Produtos
```

## 8. Diagramas de atividades

### 8.1 Atividade de compra

```mermaid
flowchart TD
    A([Início]) --> B[Usuário consulta o catálogo]
    B --> C[Busca ou filtra produtos]
    C --> D[Seleciona um produto]
    D --> E[Informa quantidade]
    E --> F[Adiciona ao carrinho]
    F --> G{Está autenticado?}
    G -- Não --> H[Realiza login ou cadastro]
    H --> F
    G -- Sim --> I[Abre o carrinho]
    I --> J{Possui endereço e cartão?}
    J -- Não --> K[Cadastra dados no dashboard]
    K --> I
    J -- Sim --> L[Solicita checkout]
    L --> M{API aprova o pedido?}
    M -- Não --> N[Exibe erro]
    M -- Sim --> O[Cria pedido e limpa carrinho]
    O --> P[Exibe confirmação]
    N --> Q([Fim])
    P --> Q
```

### 8.2 Atividade de gestão de produto

```mermaid
flowchart TD
    A([Início]) --> B[Administrador abre o dashboard]
    B --> C{Token válido e perfil admin?}
    C -- Não --> D[Redireciona para autenticação]
    C -- Sim --> E[Carrega produtos e categorias]
    E --> F[Pesquisa ou navega pela paginação]
    F --> G{Criar ou editar produto?}
    G -- Criar --> H[Preenche dados]
    G -- Editar --> I[Seleciona produto]
    I --> H
    H --> J[Escolhe categoria]
    J --> K{Categoria existe?}
    K -- Não --> L[Cria categoria]
    L --> J
    K -- Sim --> M[Seleciona imagem]
    M --> N{Imagem válida?}
    N -- Não --> O[Exibe erro de extensão, conteúdo ou tamanho]
    O --> M
    N -- Sim --> P[Calcula hash e verifica duplicidade]
    P --> Q{Imagem já existe?}
    Q -- Sim --> R[Reutiliza URL existente]
    Q -- Não --> S[Salva nova imagem]
    R --> T[Salva produto]
    S --> T
    T --> U[Atualiza lista e exibe sucesso]
    U --> V([Fim])
    D --> V
```

## 9. Diagramas de sequência

### 9.1 Login e carregamento do dashboard

```mermaid
sequenceDiagram
    actor Usuario
    participant App as Expo App
    participant Auth as Auth API
    participant Storage as AsyncStorage
    participant API as Backend Express
    participant DB as MySQL

    Usuario->>App: Informa identificador e senha
    App->>Auth: POST /users/login
    Auth->>DB: Consulta usuário
    DB-->>Auth: Dados do usuário
    Auth-->>App: JWT + dados do usuário
    App->>Storage: Salva token e usuário
    App->>API: GET /users/me com Bearer token
    API->>DB: Busca perfil, pedidos, endereços e cartões
    DB-->>API: Dados do dashboard
    API-->>App: Dados agregados
    App-->>Usuario: Exibe dashboard
```

### 9.2 Upload de imagem e criação de produto

```mermaid
sequenceDiagram
    actor Admin
    participant App as ProductPanel
    participant API as Backend Express
    participant Auth as Middleware JWT
    participant Multer as Multer
    participant FS as Sistema de arquivos
    participant DB as MySQL

    Admin->>App: Seleciona imagem e preenche produto
    App->>API: POST /products/upload-image multipart/form-data
    API->>Auth: Valida Bearer token
    Auth-->>API: Usuário autenticado
    API->>Multer: Recebe arquivo em memória
    Multer-->>API: Arquivo + MIME + tamanho
    API->>API: Valida assinatura binária e calcula SHA-256
    API->>FS: Procura arquivo com mesmo hash
    alt Imagem duplicada
        FS-->>API: Arquivo existente
        API-->>App: URL existente e duplicate=true
    else Imagem nova
        API->>FS: Salva arquivo com hash e extensão real
        API-->>App: Nova URL da imagem
    end
    App->>API: POST ou PUT /products
    API->>DB: Salva produto e categoria
    DB-->>API: Produto persistido
    API-->>App: Sucesso
    App-->>Admin: Atualiza lista e mostra toast
```

## 10. Considerações e próximos passos

- Criar testes automatizados específicos para rejeição de GIF, assinatura inválida, tamanho excedido e duplicidade de imagem.
- Adicionar uma tabela de metadados de arquivos, caso o volume de uploads cresça e a varredura do diretório deixe de ser suficiente.
- Aplicar autorização explícita de administrador no middleware de produtos, além da autenticação JWT.
- Separar configurações de desenvolvimento e produção, principalmente URL da API, CORS e armazenamento de imagens.
- Considerar armazenamento de objetos, como S3 ou serviço equivalente, para produção.
- Manter a documentação atualizada a cada mudança de fluxo ou entidade.
