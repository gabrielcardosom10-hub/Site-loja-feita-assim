# O provador com IA — o intermediário

O site é um arquivo estático. Uma chave de API dentro dele seria pública, e
qualquer pessoa gastaria a conta da loja. Este worker fica no meio: ele guarda
a chave, e o site nunca a vê.

Roda no **Cloudflare Workers**, que tem plano gratuito folgado (100 mil
requisições por dia). O que se paga é a API de try-on, por imagem gerada.

## Antes de começar

1. Uma conta na **Cloudflare** — gratuita, em cloudflare.com.
2. Uma conta na **FASHN** com créditos — fashn.ai. A chave fica em Settings →
   API. **Não me mande essa chave, nem cole em conversa nenhuma:** ela entra
   direto no Cloudflare pelo comando do passo 4.
3. **Node.js** instalado no computador.

## Publicar, passo a passo

Abra o terminal dentro desta pasta (`servidor/`) e rode, em ordem:

```bash
# 1. entrar na sua conta Cloudflare (abre o navegador)
npx wrangler login

# 2. criar o armazenamento dos contadores de teto
npx wrangler kv namespace create CONTAS
```

O comando 2 devolve algo como `id = "abc123..."`. **Cole esse id no
`wrangler.toml`**, no lugar de `<COLE_AQUI_...>`.

```bash
# 3. guardar a chave da FASHN (ela é pedida na hora, não fica em arquivo)
npx wrangler secret put FASHN_KEY

# 4. publicar
npx wrangler deploy
```

No fim ele imprime o endereço, algo como:

```
https://feita-assim-provador.SEU-NOME.workers.dev
```

## Ligar no site

Duas mudanças no `index.html`, e as duas são obrigatórias:

**1. No `CONFIG`,** dentro de `provador`, ponha o endereço:

```js
ia: { endpoint: "https://feita-assim-provador.SEU-NOME.workers.dev" },
```

**2. Na CSP, no topo do arquivo,** troque

```
connect-src 'none';
```

por

```
connect-src https://feita-assim-provador.SEU-NOME.workers.dev;
```

Sem essa segunda mudança o navegador **bloqueia** a chamada — de propósito. É
a mesma trava que hoje garante que a foto não sai do aparelho.

## Conferir se está de pé

```bash
curl https://feita-assim-provador.SEU-NOME.workers.dev/saude
```

Deve responder `{"ok":true,"hoje":0,"teto":60}`.

## O teto de gasto

`TETO_DIA` é o número de provas por dia. **Ele é o que segura a conta.** O
endereço é público — tem de ser, o site é público — e CORS só vale dentro do
navegador: quem chamar por fora não manda origem nenhuma. O teto vale para
todo mundo.

| TETO_DIA | custo por dia | por mês |
|---|---|---|
| 30 | ~US$ 2,25 | ~R$ 380 |
| 60 | ~US$ 4,50 | ~R$ 760 |
| 200 | ~US$ 15 | ~R$ 2.500 |

Cotação de US$ 0,075 por imagem e dólar a R$ 5,60 — **confira os dois antes
de decidir.** Comece em 30 e suba olhando o consumo.

Para mudar o teto depois, edite `wrangler.toml` e rode `npx wrangler deploy`
de novo.

## O que fazer se algo der errado

| sintoma | causa provável |
|---|---|
| o site diz "não consegui falar com o provador" | a CSP não foi trocada, ou o endereço está errado |
| `403 origem não autorizada` | `ORIGENS` no `wrangler.toml` não bate com o endereço do site |
| `400 a peça não é de um endereço autorizado` | falta o host das fotos em `HOSTS_PECA` |
| `429 teto do dia` | o limite diário acabou; ele volta à meia-noite UTC |
| `502` com mensagem da API | chave inválida ou sem crédito na FASHN |

## Privacidade — o que muda

Enquanto o provador era só desenho, a foto **não saía do aparelho**, e a CSP
com `connect-src 'none'` garantia isso por construção.

**Com a IA ligada, isso deixa de ser verdade.** A foto da cliente é enviada
para a API de try-on, que é uma empresa fora do Brasil. Não há como fazer
diferente: o modelo roda em servidor.

Por isso o site pede **consentimento explícito** antes do primeiro envio e diz
para onde a foto vai. Isso não é gentileza: é obrigação da LGPD, e a loja é a
controladora desses dados. Antes de publicar, confira na política da FASHN por
quanto tempo elas guardam a imagem, e diga isso à cliente.

Este worker não guarda a foto, não a escreve em log e não a manda para nenhum
outro lugar.
