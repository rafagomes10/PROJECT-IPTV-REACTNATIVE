# Fire IPTV - Rodando no Navegador

Este guia explica como executar o app IPTV diretamente no navegador.

## Requisitos

- Node.js (versão 18 ou superior)
- NPM ou Yarn

## Instalação das Dependências de Web

```bash
# Instalar dependências (já configuradas no projeto)
npm install
```

## Executar no Navegador

### Modo Desenvolvimento (com hot reload)
```bash
npm run web
```

O app será aberto automaticamente em: **http://localhost:3000**

### Construir para Produção
```bash
npm run build:web
```

Os arquivos serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor web.

## Acessando de Outros Dispositivos

Para acessar o app de outro computador ou celular na mesma rede:

1. Descubra o IP da sua máquina:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Acesse pelo navegador:
   ```
   http://SEU_IP:3000
   ```

   Exemplo: `http://192.168.1.100:3000`

## Funcionalidades no Web

Todas as funcionalidades do app estão disponíveis no navegador:

- Tela de login com URL, usuário e senha
- Listagem de canais por categoria
- Player de vídeo (simulação)
- Navegação por teclado (setas, Enter, Escape)

### Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| ↑ ↓ ← → | Navegar entre elementos |
| Enter | Selecionar/Confirmar |
| Escape | Voltar/Cancelar |

## Solução de Problemas

### Erro "Cannot find module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Porta 3000 ocupada
```bash
# Usar outra porta
npm run web -- --port 3001
```

### Erros de compilação TypeScript
```bash
# Verificar tipos
npx tsc --noEmit
```

## Notas

- O app usa `react-native-web` para compatibilidade com componentes do React Native no navegador
- O player de vídeo é simulado na versão web (sem suporte nativo a streams HLS/RTMP do browser)
- Para uma experiência completa, recomenda-se compilar o APK Android e instalar no Fire Stick
