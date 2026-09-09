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

### Três fornecedores possíveis — a chave que existir decide

Não tem variável de "qual motor usar". Você põe **uma** das três chaves, e o
código escolhe sozinho pela que encontrar, nesta ordem — Gemini direto,
depois OpenRouter, depois FASHN:

|  | Gemini direto | OpenRouter (Gemini) | FASHN |
|---|---|---|---|
| o que é | a mesma família de modelo de imagem do Google, sem intermediário | o mesmo modelo, através da OpenRouter | modelo feito SÓ para vestir roupa em pessoa |
| preço por imagem | ≈ US$ 0,04–0,07 (confira, muda sem aviso) | ≈ US$ 0,04–0,07 | ≈ US$ 0,075 |
| **se você tem Google AI Pro** | os primeiros US$ 10/mês já vêm cobertos pela assinatura — ver abaixo | não conta para o Pro (é conta separada da OpenRouter) | não conta para o Pro |
| qualidade | boa em vestir a peça; menos previsível em montar o corpo inteiro só a partir do rosto | igual ao Gemini direto — é o mesmo modelo | mais consistente nas duas etapas, porque só faz isso |
| conta | **aistudio.google.com** — a mesma do Google AI Pro, se você já tem | openrouter.ai — uma chave só, se já usa noutros projetos | conta própria na fashn.ai |

**Se você já paga o Google AI Pro (a assinatura de ~US$ 20/mês, com Gemini
Advanced e afins), o caminho Gemini direto é o que aproveita isso**: desde
abril de 2026 essa assinatura já vem com US$ 10 em créditos de nuvem por mês,
usáveis direto na API — então uma parte do provador sai de graça, dentro do
que você já paga. Confira no seu painel do Google AI Studio se esse crédito
aparece disponível antes de contar com ele.

Se você não tem Pro nem quer abrir conta nova no Google, e já usa a
OpenRouter para outra coisa, ela serve igual — é o mesmo modelo por baixo,
só muda o caminho até ele.

Se notar que o avatar (a etapa de "montar o corpo a partir do rosto") sai
estranho com frequência em qualquer um dos dois caminhos do Gemini, vale
tentar a FASHN — ou ajustar o texto do pedido em `PROMPT_AVATAR`, no topo de
`api/provar.js`.

### Ligar — caminho Gemini direto (aproveita o Google AI Pro)

1. Entre em **aistudio.google.com** com a MESMA conta Google da sua
   assinatura Pro (se tiver uma) → **Get API key** → crie uma chave.
   **Não me mande essa chave, nem cole em conversa nenhuma.**
2. No painel da Vercel, abra o projeto → **Settings** → **Environment
   Variables** e crie:

| nome | valor | para quê |
|---|---|---|
| `GEMINI_KEY` | a sua chave | **obrigatória** — sem ela (e sem as outras duas) o provador responde que não foi configurado |
| `ORIGENS` | `https://site-loja-feita-assim.vercel.app` | de onde o site pode chamar |
| `HOSTS_PECA` | `d8j0ntlcm91z4.cloudfront.net,site-loja-feita-assim.vercel.app` | de onde as fotos das peças podem vir |
| `TETO_MES` | `250` | **o teto do bolso** — imagens no mês inteiro. Ver abaixo |
| `TETO_HORA` | `20` | gerações por hora, no site todo (contra rajada) |
| `TETO_IP` | `6` | gerações por hora, por pessoa (contra abuso) |
| `GEMINI_MODELO` | `gemini-3.1-flash-image` | opcional — troque se o Google aposentar este modelo (acontece sem aviso) |

Repare que o teto do mês continua valendo mesmo com o crédito do Pro: ele
protege contra passar do que você decidiu gastar, os US$ 10 inclusos sendo
suficientes ou não.

### Ligar — caminho OpenRouter

1. Em **openrouter.ai** → Keys, crie uma chave e coloque **créditos
   limitados** na conta (é o único teto que não depende de nenhuma linha de
   código estar certa). **Não me mande essa chave, nem cole em conversa
   nenhuma.**
2. No painel da Vercel, abra o projeto → **Settings** → **Environment
   Variables** e crie:

| nome | valor | para quê |
|---|---|---|
| `OPENROUTER_KEY` | a sua chave | **obrigatória** — sem ela (e sem `GEMINI_KEY`/`FASHN_KEY`) o provador responde que não foi configurado |
| `ORIGENS` | `https://site-loja-feita-assim.vercel.app` | de onde o site pode chamar |
| `HOSTS_PECA` | `d8j0ntlcm91z4.cloudfront.net,site-loja-feita-assim.vercel.app` | de onde as fotos das peças podem vir |
| `TETO_MES` | `250` | **o teto do bolso** — imagens no mês inteiro. Ver abaixo |
| `TETO_HORA` | `20` | gerações por hora, no site todo (contra rajada) |
| `TETO_IP` | `6` | gerações por hora, por pessoa (contra abuso) |
| `OPENROUTER_MODELO` | `google/gemini-3.1-flash-image` | opcional — troque se o Google aposentar este modelo (acontece sem aviso) |

### Ligar — caminho FASHN

1. Crie uma conta na **fashn.ai** e compre créditos. A chave fica em
   Settings → API.
   **Não me mande essa chave, nem cole em conversa nenhuma.**
2. As mesmas variáveis acima, trocando `OPENROUTER_KEY` por:

| nome | valor | para quê |
|---|---|---|
| `FASHN_KEY` | a sua chave | **obrigatória** |
| `MODELO_AVATAR` | `face-to-model` | opcional — o modelo que vira o rosto em corpo |
| `MODELO_TRYON` | `tryon-v1.6` | opcional — o modelo que veste a peça |

3. **Redeploy** (a Vercel só aplica variáveis novas num deploy novo).

Os nomes de modelo (dos três fornecedores, incluindo `GEMINI_MODELO` e
`OPENROUTER_MODELO` acima) existem como variável porque a API deles muda de
versão sem avisar.
Se um dia o provador parar com erro `502` citando o nome do modelo, troque o
nome na variável e faça outro redeploy — sem mexer em código.

Só isso. No `index.html` o `endpoint` **já está em `"/api/provar"`** — não
precisa mexer.

A ordem deixou de importar, e essa é a mudança que tornou seguro deixar
ligado: antes de mostrar qualquer botão, o site **pergunta à função se ela
está de pé**. Se a chave ainda não estiver lá, ele nem oferece o caminho da
IA — mostra o provador de graça e pronto. Ninguém consente em mandar o rosto
para fora para depois receber um erro.

Pronto. Com a chave no lugar, quem escuta o resultado é o próprio provador —
mas **confira antes se o modo de foto está ligado**: ele pode estar escondido
da tela por `AVATAR_DESLIGADO` no `index.html` (busque por essa palavra). Se
estiver `true`, a chave funciona no servidor mas ninguém vê o botão — vire
para `false` para o modo aparecer.

### Conferir

Abra `https://site-loja-feita-assim.vercel.app/api/provar` no navegador. Com a
chave configurada ele responde `{"erro":"identificador inválido"}` **se o
motor for a FASHN** — o que é o esperado, porque faltou o `?id=`. **Com o
Gemini direto ou a OpenRouter** não existe consulta por identificador (a
resposta já vem pronta no POST), então essa rota responde
`{"erro":"este motor não usa consulta por identificador"}` — também
esperado, e também sinal de que a chave chegou. Se qualquer um deles
responder `{"erro":"sem chave"}`, a variável não chegou: confira o nome e
refaça o deploy.

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

Com US$ 0,06 por imagem (faixa da OpenRouter; a FASHN fica perto de US$ 0,075):

| você aceita gastar | `TETO_MES` |
|---|---|
| US$ 10 no mês | `166` |
| US$ 15 no mês | `250` ← é o padrão, se você não puser nada |
| US$ 30 no mês | `500` |

**Confira o preço no site do fornecedor que você escolheu antes de fechar o
número** — muda sem aviso, e os dois fornecedores não cobram o mesmo.

Batido o teto, o provador com IA para até o mês virar. E aqui está a parte
que importa: **o site não mostra erro.** Ele cai sozinho no provador de graça
— o rosto da cliente sobre o corpo desenhado, que roda no aparelho dela e não
custa nada. Ninguém fica sem provador; ele só fica menos bonito até o dia 1º.

Vale também para: chave faltando, fornecedor fora do ar, e a cliente recusando
mandar o rosto. Nos quatro casos o site cai no de graça, calado.

Uma coisa que o código faz de propósito: **pedido inválido não queima o teto do
mês.** Só conta o que virou geração de verdade no fornecedor. Quem segura
tentativa inválida e ataque são os dois tetos de baixo, que somam sempre.

### 2 e 3. `TETO_HORA` e `TETO_IP` — os de rajada

Seguram um pico de acesso e um abusador. Zeram a cada hora. **Não protegem o
bolso no mês** — 20 por hora dá 14.400 por mês.

### E o que nunca falha

**O saldo pré-pago no fornecedor** — no Google AI Studio, na OpenRouter ou na FASHN, qualquer uma
das duas. Ele não depende de nenhuma linha deste código estar certa. Compre
crédito limitado; é o único teto que não depende de nada.

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

Custo de referência: **US$ 0,04 a 0,075 por geração** conforme o fornecedor
(uns **R$ 0,22 a R$ 0,42**). Uma cliente que monta o avatar e prova três
peças gasta 4 gerações ≈ **R$ 0,90 a R$ 1,68**. Confira a cotação e o preço
atual antes de decidir — dos dois lados, câmbio e fornecedor mudam sem aviso.

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

**Com a IA ligada, as fotos do ROSTO da cliente são enviadas para o
fornecedor configurado** (Google, OpenRouter ou FASHN, conforme a chave que estiver
na Vercel), que fica fora do Brasil. Não há como fazer diferente: o modelo
roda em servidor.

Foto de rosto é dado biométrico, e isso pesa mais do que uma foto qualquer.
Por isso o modo avatar **só existe quando a IA está ligada**: sem ela o botão
nem aparece, e ninguém entrega o rosto para nada.

Por isso o site pede **consentimento explícito** antes do primeiro envio e diz
para onde a foto vai. Isso é obrigação da LGPD, e **a loja é a controladora
desses dados**. Antes de publicar:

- confira na política do fornecedor escolhido (Google, OpenRouter ou FASHN) por
  quanto tempo a imagem fica guardada;
- escreva isso em `CONFIG.provador.ia.guarda`, no `index.html` — esse texto
  aparece na caixa de consentimento.

A função não guarda a foto, não a escreve em log e não a manda para nenhum
outro lugar.

---

## Caminho 2 — Cloudflare Workers (alternativa)

Só se o site sair da Vercel. O arquivo é `worker.js`, nesta pasta — e **ele
só sabe falar com a FASHN**. Os caminhos do Gemini direto e da OpenRouter descritos acima existem só
na versão Vercel (`api/provar.js`); portar para o worker é trabalho que ainda
não foi feito.

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
| o modo de foto nem aparece na tela | `AVATAR_DESLIGADO` está `true` no `index.html` — a chave pode estar certa e mesmo assim ninguém vê o botão |
| "o provador não foi configurado" | falta `GEMINI_KEY`, `OPENROUTER_KEY` **e** `FASHN_KEY`, ou faltou o redeploy |
| "não consegui falar com o provador" | o caminho em `CONFIG` não bate com o da função |
| `403 origem não autorizada` | `ORIGENS` não bate com o endereço do site |
| `400 a peça não é de um endereço autorizado` | falta o host das fotos em `HOSTS_PECA` |
| `429 teto da hora` | o limite acabou; ele volta na hora seguinte |
| `502` com mensagem da API | chave inválida, sem crédito, ou (na OpenRouter) o modelo recusou o pedido por segurança — tente fotos diferentes |
| `502 a IA não devolveu uma imagem` (só na OpenRouter) | o modelo respondeu só com texto, sem gerar imagem — normalmente é recusa de segurança; tente de novo com outra foto |
