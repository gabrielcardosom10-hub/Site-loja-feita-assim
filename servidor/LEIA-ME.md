# O provador com IA — o intermediário

> **Você não precisa de nada disto para o provador funcionar.** O site já tem
> um provador de avatar ligado e funcionando: a cliente manda uma foto do
> rosto, o site encaixa esse rosto no corpo desenhado e veste as peças nele.
> Roda no aparelho dela, **não custa nada por imagem** e a foto não sai do
> celular. Este arquivo é só para quem decidir pagar pela versão em que a peça
> é vestida por inteligência artificial e o resultado parece uma fotografia.
>
> E repare: ligar a IA **troca** o provador, não soma. Detalhes no `CONFIG`,
> no bloco `provador.ia`.

O site é estático. Uma chave de API dentro dele seria pública, e qualquer
pessoa gastaria a conta da loja. O intermediário fica no meio: ele guarda a
chave, e o navegador nunca a vê.

**O site está na Vercel, então o caminho é o de cima.** O worker do Cloudflare
continua aqui como alternativa, para o caso de a hospedagem mudar de novo.

---

## Caminho 1 — Vercel (é o do seu site)

O arquivo é `api/provar.js`, na raiz do projeto. Ele **sobe junto com o site**:
não há comando para rodar, nem segunda conta para criar.

### Ligar

1. Crie uma conta na **fashn.ai** e compre créditos. A chave fica em
   Settings → API.
   **Não me mande essa chave, nem cole em conversa nenhuma.**
2. No painel da Vercel, abra o projeto → **Settings** → **Environment
   Variables** e crie:

| nome | valor | para quê |
|---|---|---|
| `FASHN_KEY` | a sua chave | **obrigatória** — sem ela o provador responde que não foi configurado |
| `ORIGENS` | `https://site-loja-feita-assim.vercel.app` | de onde o site pode chamar |
| `HOSTS_PECA` | `d8j0ntlcm91z4.cloudfront.net,site-loja-feita-assim.vercel.app` | de onde as fotos das peças podem vir |
| `TETO_HORA` | `20` | gerações por hora, no site todo |
| `TETO_IP` | `6` | gerações por hora, por pessoa |
| `MODELO_AVATAR` | `face-to-model` | opcional — o modelo que vira o rosto em corpo |
| `MODELO_TRYON` | `tryon-v1.6` | opcional — o modelo que veste a peça |

Os dois últimos existem porque a API do fornecedor muda de versão sem avisar.
Se um dia o provador parar com erro `502` citando o nome do modelo, troque o
nome na variável e faça o redeploy — sem mexer em código.

3. **Redeploy** (a Vercel só aplica variáveis novas num deploy novo).
4. No `index.html`, em `CONFIG.provador.ia`, troque `endpoint: ""` por
   `endpoint: "/api/provar"` e publique.

O passo 4 é de propósito o último. Com o botão no ar e a função sem chave, a
cliente consentiria em mandar a foto dela para fora e receberia um erro —
consentimento gasto à toa é pior do que botão nenhum.

Pronto. O botão "Provar de verdade com IA" aparece no provador, no modo
"Na minha foto".

### Conferir

Abra `https://site-loja-feita-assim.vercel.app/api/provar` no navegador. Com a
chave configurada ele responde `{"erro":"identificador inválido"}` — o que é o
esperado, porque faltou o `?id=`. Se responder `{"erro":"sem chave"}`, a
variável não chegou: confira o nome e refaça o deploy.

---

## O teto de gasto — leia antes de ligar

O endereço é público, e tem de ser. Existem **dois** tetos, e eles não têm o
mesmo peso:

**O que segura de verdade é o saldo pré-pago na FASHN.** Ele não depende de
nenhuma linha deste código estar certa. Compre crédito limitado; é o único
teto que não falha.

**O daqui é por hora e por IP.** Ele é rígido só se você configurar o Upstash
(abaixo). Sem Upstash ele vale dentro de cada instância quente da função — a
Vercel cria várias — então ele **ajuda contra rajada e não substitui o saldo**.

### Quanto custa cada cliente

São **duas gerações pagas**, e elas não têm a mesma frequência:

| quando | o que acontece | quantas vezes |
|---|---|---|
| ao montar o avatar | as fotos do rosto viram um corpo | **uma vez** por cliente |
| ao escolher uma peça | a peça é vestida no avatar | **uma por peça provada** |

O avatar é criado uma vez e reaproveitado em todas as provas — foi decisão de
projeto, e é o que impede a conta de dobrar a cada peça.

Custo de referência: **US$ 0,075 por geração**, cerca de **R$ 0,42**. Uma
cliente que monta o avatar e prova três peças gasta 4 gerações ≈ **R$ 1,68**.
Confira a cotação e o preço atual antes de decidir.

| gerações/hora | pico teórico por dia | custo |
|---|---|---|
| 20 | 480 | ~US$ 36 |
| 6 | 144 | ~US$ 11 |

O pico teórico só acontece se o site ficar 24h no limite. Na prática o saldo
pré-pago é o que você deve dimensionar.

### Teto rígido (opcional, grátis)

Para o teto por hora valer entre todas as instâncias:

1. Crie um banco gratuito no **upstash.com** (Redis).
2. Copie `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` para as
   variáveis de ambiente da Vercel.
3. Redeploy.

A função usa automaticamente quando as duas existem, e volta ao modo memória
se o Upstash cair — o provador não para por causa disso.

---

## Privacidade — o que muda ao ligar

Enquanto o provador era só desenho, a foto **não saía do aparelho**, e a CSP
com `connect-src 'self'` garantia isso por construção.

**Com a IA ligada, as fotos do ROSTO da cliente são enviadas para a FASHN**,
que fica fora do Brasil. Não há como fazer diferente: o modelo roda em
servidor.

Foto de rosto é dado biométrico, e isso pesa mais do que uma foto qualquer.
Por isso o modo avatar **só existe quando a IA está ligada**: sem ela o botão
nem aparece, e ninguém entrega o rosto para nada.

Por isso o site pede **consentimento explícito** antes do primeiro envio e diz
para onde a foto vai. Isso é obrigação da LGPD, e **a loja é a controladora
desses dados**. Antes de publicar:

- confira na política da FASHN por quanto tempo a imagem fica guardada;
- escreva isso em `CONFIG.provador.ia.guarda`, no `index.html` — esse texto
  aparece na caixa de consentimento.

A função não guarda a foto, não a escreve em log e não a manda para nenhum
outro lugar.

---

## Caminho 2 — Cloudflare Workers (alternativa)

Só se o site sair da Vercel. O arquivo é `worker.js`, nesta pasta.

```bash
npx wrangler login
npx wrangler kv namespace create CONTAS   # cole o id no wrangler.toml
npx wrangler secret put FASHN_KEY
npx wrangler deploy
```

Depois ponha o endereço em `CONFIG.provador.ia.endpoint` e troque, na CSP do
`index.html`, `connect-src 'self'` pelo endereço do worker — sem isso o
navegador bloqueia a chamada, de propósito.

## O que fazer se algo der errado

| sintoma | causa provável |
|---|---|
| "o provador não foi configurado" | falta `FASHN_KEY`, ou faltou o redeploy |
| "não consegui falar com o provador" | o caminho em `CONFIG` não bate com o da função |
| `403 origem não autorizada` | `ORIGENS` não bate com o endereço do site |
| `400 a peça não é de um endereço autorizado` | falta o host das fotos em `HOSTS_PECA` |
| `429 teto da hora` | o limite acabou; ele volta na hora seguinte |
| `502` com mensagem da API | chave inválida ou sem crédito na FASHN |
