# O provador com IA — o intermediário

> **Você não precisa de nada disto para o provador funcionar.** O site já tem
> um provador de avatar ligado e funcionando: a cliente manda uma foto do
> rosto, o site encaixa esse rosto no corpo desenhado e veste as peças nele.
> Roda no aparelho dela, **não custa nada por imagem** e a foto não sai do
> celular. Este arquivo é só para quem decidir pagar pela versão em que a peça
> é vestida por inteligência artificial e o resultado parece uma fotografia.
>
> Os dois convivem: a IA manda quando está de pé e dentro do teto do mês, e o
> de graça é a rede embaixo dela. Detalhes no `CONFIG`, no bloco
> `provador.ia`.

O site é estático. Uma chave de API dentro dele seria pública, e qualquer
pessoa gastaria a conta da loja. O intermediário fica no meio: ele guarda a
chave, e o navegador nunca a vê.

**O site está na Vercel, então o caminho é o de cima.** O worker do Cloudflare
continua aqui como alternativa, para o caso de a hospedagem mudar de novo —
mas atenção: **o `TETO_MES` e a resposta de saúde só existem na versão da
Vercel.** Se um dia a loja mudar para o Cloudflare, o worker precisa receber
os dois antes de ligar a IA lá.

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
| `TETO_MES` | `200` | **o teto do bolso** — imagens no mês inteiro. Ver abaixo |
| `TETO_HORA` | `20` | gerações por hora, no site todo (contra rajada) |
| `TETO_IP` | `6` | gerações por hora, por pessoa (contra abuso) |
| `MODELO_AVATAR` | `face-to-model` | opcional — o modelo que vira o rosto em corpo |
| `MODELO_TRYON` | `tryon-v1.6` | opcional — o modelo que veste a peça |

Os dois últimos existem porque a API do fornecedor muda de versão sem avisar.
Se um dia o provador parar com erro `502` citando o nome do modelo, troque o
nome na variável e faça o redeploy — sem mexer em código.

3. **Redeploy** (a Vercel só aplica variáveis novas num deploy novo).

Só isso. No `index.html` o `endpoint` **já está em `"/api/provar"`** — não
precisa mexer.

A ordem deixou de importar, e essa é a mudança que tornou seguro deixar
ligado: antes de mostrar qualquer botão, o site **pergunta à função se ela
está de pé**. Se a chave ainda não estiver lá, ele nem oferece o caminho da
IA — mostra o provador de graça e pronto. Ninguém consente em mandar o rosto
para fora para depois receber um erro.

Pronto. Com a chave no lugar, o botão "Provar de verdade com IA" aparece no
provador, no modo **"No meu avatar"**. Sem a chave, o mesmo modo mostra o
provador que roda no aparelho da cliente.

### Conferir

Abra `https://site-loja-feita-assim.vercel.app/api/provar` no navegador. Com a
chave configurada ele responde `{"erro":"identificador inválido"}` — o que é o
esperado, porque faltou o `?id=`. Se responder `{"erro":"sem chave"}`, a
variável não chegou: confira o nome e refaça o deploy.

---

## O teto de gasto — leia antes de ligar

O endereço é público, e tem de ser. Existem **três** tetos, e eles fazem
trabalhos diferentes.

### 1. `TETO_MES` — o do bolso

É o que responde "quanto isso pode me custar até o dia 30". Ele conta
**imagens**, não reais — porque preço muda, câmbio muda, e código que finge
saber o câmbio mente. A conta é sua:

```
quanto você aceita gastar  ÷  preço da imagem  =  TETO_MES
```

Com US$ 0,075 por imagem:

| você aceita gastar | `TETO_MES` |
|---|---|
| US$ 10 no mês | `133` |
| US$ 15 no mês | `200` ← é o padrão, se você não puser nada |
| US$ 30 no mês | `400` |

**Confira o preço no site da FASHN antes de fechar o número.**

Batido o teto, o provador com IA para até o mês virar. E aqui está a parte
que importa: **o site não mostra erro.** Ele cai sozinho no provador de graça
— o rosto da cliente sobre o corpo desenhado, que roda no aparelho dela e não
custa nada. Ninguém fica sem provador; ele só fica menos bonito até o dia 1º.

Vale também para: chave faltando, fornecedor fora do ar, e a cliente recusando
mandar o rosto. Nos quatro casos o site cai no de graça, calado.

Uma coisa que o código faz de propósito: **pedido inválido não queima o teto do
mês.** Só conta o que virou geração de verdade na FASHN. Quem segura tentativa
inválida e ataque são os dois tetos de baixo, que somam sempre.

### 2 e 3. `TETO_HORA` e `TETO_IP` — os de rajada

Seguram um pico de acesso e um abusador. Zeram a cada hora. **Não protegem o
bolso no mês** — 20 por hora dá 14.400 por mês.

### E o que nunca falha

**O saldo pré-pago na FASHN.** Ele não depende de nenhuma linha deste código
estar certa. Compre crédito limitado; é o único teto que não depende de nada.

Os três daqui só são rígidos com o **Upstash** configurado (abaixo, e o plano
de graça dá conta com folga). Sem Upstash cada instância quente da função tem
o seu contador — a Vercel cria várias — e o `TETO_MES` vira estimativa, não
trava. **Se o teto do mês importa para você, configure o Upstash.**

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
