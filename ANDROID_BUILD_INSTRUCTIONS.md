# Como Criar um APK (Android)

Este projeto foi configurado com **Capacitor** para permitir a criação de um aplicativo Android nativo a partir do código web existente.

Como o ambiente de desenvolvimento online não possui o Android Studio instalado, você precisará realizar os passos finais em sua máquina local.

## Pré-requisitos

1.  **Node.js** instalado (versão 18 ou superior).
2.  **Android Studio** instalado e configurado (com SDKs do Android).

## Passo a Passo

### 1. Baixe o Código
Baixe todo o código deste projeto para sua máquina local.

### 2. Instale as Dependências
Abra o terminal na pasta do projeto e execute:
```bash
npm install
```

### 3. Gere o Build da Aplicação Web
Isso criará a pasta `dist` com os arquivos otimizados do seu site:
```bash
npm run build
```

### 4. Adicione a Plataforma Android
Este comando cria a estrutura nativa do Android na pasta `android/`:
```bash
npx cap add android
```

### 5. Sincronize os Arquivos
Copie os arquivos da pasta `dist` para a pasta nativa do Android:
```bash
npm run cap:sync
```

### 6. Abra no Android Studio
Este comando abrirá o projeto Android no Android Studio automaticamente:
```bash
npm run cap:open
```

### 7. Gere o APK
No Android Studio:
1.  Aguarde a indexação do projeto (Gradle Sync).
2.  Vá no menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3.  O Android Studio irá gerar o arquivo `.apk` que você pode instalar em seu celular.

## Dicas Adicionais

*   **Ícone do App:** Para alterar o ícone, você pode usar a ferramenta `cordova-res` ou substituir manualmente os ícones na pasta `android/app/src/main/res/mipmap-*`.
*   **Permissões:** Se precisar de permissões extras (câmera, localização), edite o arquivo `android/app/src/main/AndroidManifest.xml`.
*   **Atualizações:** Sempre que alterar o código do site (React), rode `npm run build` e depois `npm run cap:sync` para atualizar a versão Android.
