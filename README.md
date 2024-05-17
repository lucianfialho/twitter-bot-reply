# Twitter Automation Script

Este script automatiza a interação com tweets no Twitter usando Puppeteer para controle de navegador e a API da OpenAI para gerar respostas inteligentes a tweets. Ele realiza login no Twitter, monitora por novos tweets em um perfil específico e posta comentários em resposta aos novos tweets detectados.

## Requisitos

- Node.js
- Uma conta no Twitter
- Uma chave de API da OpenAI

## Configuração

### Instalação das Dependências

Execute o seguinte comando para instalar todas as dependências necessárias, incluindo `puppeteer` e `openai`:

```bash
npm install
```

OU

```bash
yarn install
```

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no arquivo .env na raiz do seu projeto, você pode copiar o .env.example:

```plaintext
OPENAI_SECRET=<Sua Chave da API da OpenAI>
TWITTER_USERNAME=<Seu Nome de Usuário do Twitter>
TWITTER_PASSWORD=<Sua Senha do Twitter>
PROMPT=<Seu Prompt Personalizado para a OpenAI>
TWITTER_URL_TO_FETCH=<URL do Perfil do Twitter ou url da hashtag para Monitorar>
RANDOM_STATIC_TWEETS=comentário1,comentário2,comentário3
LINKEDIN_USER_NAME=username
LINKEDIN_PASSWORD=password
```

### Funções

`setupBrowser()`
Inicializa o navegador Puppeteer e configura uma nova página com um viewport específico.

`loginOnTwitter(page)`
Realiza login no Twitter usando credenciais fornecidas via variáveis de ambiente.

`interact(tweet)`
Gera uma resposta para um tweet usando a API da OpenAI, com base em um prompt personalizado e conteúdo do tweet.

`getRandomComment()`
Seleciona um comentário aleatório de uma lista de comentários estáticos definidos na variável de ambiente RANDOM_STATIC_TWEETS, convertida de uma string delimitada por vírgulas para um array.

`twitterSearchAndComment(page, newTweetContent)`
Navega até um perfil do Twitter, espera por um novo tweet e posta um comentário gerado pela função interact ou selecionado pela função getRandomComment.

`run()`
Executa o loop principal que verifica novos tweets no perfil especificado e interage com eles conforme especificado.

## Execução

Para iniciar o script, execute:

```bash
node automate.js
```

O script continuará rodando em loop, verificando por novos tweets e interagindo com eles conforme especificado.

## Notas

- Este script é para propósitos educacionais e deve ser usado de acordo com as políticas do Twitter e da OpenAI.
- Ajuste a frequência de verificação conforme necessário para evitar limitações de taxa impostas pelo Twitter.
