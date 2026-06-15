# Fire IPTV - App para Smart TV (Fire Stick)

Aplicativo IPTV desenvolvido em React Native, otimizado para Amazon Fire Stick e Android TV.

## Funcionalidades

- Login com URL do servidor, usuário e senha
- Interface otimizada para TV (navegação com controle remoto)
- Listagem de canais por categorias
- Player de vídeo integrado
- Suporte a D-pad do Fire Stick

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── context/          # Contextos (AuthContext)
├── hooks/            # Hooks customizados (useTVNavigation)
├── screens/          # Telas do app
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   └── PlayerScreen.tsx
├── types/            # Tipos TypeScript
└── utils/            # Funções utilitárias
```

## Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar no Android (modo desenvolvimento)
```bash
npx react-native run-android
```

### 3. Instalar no Fire Stick
1. Ativar "Depuração ADB" e "Apps de fontes desconhecidas" nas configurações do Fire Stick
2. Conectar via ADB:
```bash
adb connect <IP_DO_FIRE_STICK>:5555
```
3. Instalar o APK:
```bash
cd android/app/build/outputs/apk/debug
adb install app-debug.apk
```

## Uso

### Tela de Login
- Digite a URL do servidor IPTV
- Digite o nome de usuário
- Digite a senha
- Pressione "ENTRAR"

### Tela Principal (Home)
- **Barra lateral esquerda**: Lista de categorias
- **Área central**: Grid de canais
- Navegue com as setas do controle remoto
- Pressione "OK/Select" para abrir um canal

### Tela do Player
- Controles aparecem ao tocar na tela
- Botões: Voltar, Play/Pause, Próximo/Anterior
- Pressione "Back" no controle para voltar

## Mapeamento de Teclas (Fire Stick)

| KeyCode | Ação         |
|---------|--------------|
| 19      | Cima         |
| 20      | Baixo        |
| 21      | Esquerda     |
| 22      | Direita      |
| 23/66   | OK/Select    |
| 4/27    | Voltar       |

## Próximos Passos (TODO)

- [ ] Integração com API real de IPTV (Xtream Codes)
- [ ] Suporte a EPG (Guia de Programação)
- [ ] Lista de favoritos
- [ ] Busca de canais
- [ ] Suporte a VOD (Vídeo On Demand)
- [ ] Melhorar suporte a controles remotos diversos

## Licença

Este projeto é para fins educacionais.
