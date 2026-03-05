# Lista de Passageiros

Aplicativo de gerenciamento de passageiros com controle financeiro e suporte offline (PWA).

## Funcionalidades

*   Cadastro e edição de passageiros.
*   Controle de pagamentos (Pix, Dinheiro, Cartão).
*   Geração de relatórios em PDF.
*   Funciona offline (PWA).
*   Instalável em Android/iOS.

## Como Rodar Localmente

1.  Clone este repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## Gerar APK (Android)

Este projeto está configurado com **Capacitor** para gerar aplicativos Android nativos.

Consulte o arquivo [ANDROID_BUILD_INSTRUCTIONS.md](./ANDROID_BUILD_INSTRUCTIONS.md) para o passo a passo completo.

## PWA (Progressive Web App)

O aplicativo já é um PWA completo. Para instalar no celular sem gerar APK:
1.  Abra o site no Chrome (Android) ou Safari (iOS).
2.  Toque em "Adicionar à Tela Inicial".
