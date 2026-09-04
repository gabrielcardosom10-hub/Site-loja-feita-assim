# Sistema visual — Feita Assim

Extraído do logo da loja. Tudo aqui está aplicado no `index.html`, nas
variáveis CSS do topo do arquivo.

## O que o logo diz

A tulipa é magenta sobre ameixa, o texto é branco, **em caixa baixa**, e a
letra é geométrica arredondada. Nada no logo é anguloso ou apertado. A marca
é macia, e o site precisa concordar com ela.

## Cor

| variável | valor | papel |
|---|---|---|
| `--tinta` | `#2E0F3D` | ameixa escura: texto e fundos fechados |
| `--ameixa` | `#6B1580` | o roxo do logo: superfícies |
| `--rosa` | `#FF1D6E` | o magenta da tulipa: só em tipo grande |
| `--rosa-forte` | `#D6006A` | o mesmo magenta fechado: botões e links |
| `--papel` | `#FBF7F9` | off-white morno: o fundo da página |
| `--cal` | `#FFFFFF` | branco das fotos e do bilhete |
| `--lilas` | `#D7C2E2` | texto secundário sobre roxo |
| `--rosa-claro` | `#FFA0C4` | magenta claro sobre roxo |
| `--cinza` | `#6B5878` | texto secundário sobre papel |

**Por que dois rosas.** O magenta vivo tem 3,5:1 sobre papel — passa em
título grande, reprova em texto corrido. `--rosa-forte` é o mesmo tom
fechado até 5,0:1, e é ele que vai em botão, link e preço.

**Onde o roxo entra.** Três lugares, não mais: a tarja do topo, a seção da
loja e o rodapé. O miolo é claro e a fotografia manda.

## Tipografia

**DM Sans**, uma família só, em todos os papéis.

Geométrica como o logo, e neutra de propósito. Página que converte usa tipo
que sai da frente: quem precisa chamar atenção é a peça, o preço e o botão —
não a letra. Sem serifada, sem condensada, sem segunda família.

| papel | tratamento |
|---|---|
| Título da capa | 700, caixa baixa, 2ª linha em 300 rosa claro |
| Título de seção | 600, caixa baixa, entreletras −0.02em |
| Corpo | 400, 16px, altura 1.6 |
| Interface | 12px, 600, caixa alta, entreletras +0.09em |

A caixa alta vive só na camada de interface — menu, botões, etiquetas, selos.
Título nenhum é caixa alta.

## Forma

`--r: 4px` — curva mínima, ecoando a pétala, em botão, campo, selo e
seletor de tamanho. Foto e seção continuam de canto reto: a curva marca o
que a mão toca, não tudo.

## Proporção

- Foto de produto: 4:5, retrato
- Foto do Instagram: 1:1
- Abertura: deitada, com metade do quadro vazia de um lado

## A capa

Carrossel de tela cheia. Os slides ficam empilhados no mesmo lugar e trocam
por **fusão**, nunca deslizando: deslizar chamaria atenção para a mecânica em
vez da roupa. O slide ativo faz uma aproximação lenta de 9 segundos.

Cada slide tem etiqueta partida nas duas pontas de uma linha, título em duas
linhas — a segunda em peso leve e rosa claro —, legenda em caixa baixa e botão
vazado.

**Entreletras curtas.** A etiqueta e o botão andavam em `.18em` e a legenda em
`.2em` caixa alta: de perto lia-se bem, mas na capa inteira as palavras
apareciam como letras soltas, não como frase. Hoje a etiqueta e o botão estão
em `.03em`/`.035em` e a legenda desceu para caixa baixa em `.04em`. Quem chama
atenção na capa é o título; a interface em volta não deve disputar.

**A linha da etiqueta encurtou.** Os dois rótulos continuam nas pontas de uma
linha — é a assinatura da capa —, mas a linha ia a `34vw`. Nessa largura os dois
ficavam tão longe que liam como duas coisas separadas, e não como um par. Hoje
vai a `21vw`, com teto de 290px.

**O véu, e por que ele tinha faixa.** O véu é um degradê grande de ameixa por
cima da foto, e ele vinha com quatro paradas. Num degradê que atravessa 1400px,
cada parada é uma quina na curva de opacidade, e quina em área grande de roxo é
o que o olho lê como faixa. Hoje a curva é uma *smoothstep* amostrada em 21
paradas: sem quina em lugar nenhum, e passo de opacidade pequeno demais para
render degrau. Medido sobre um roxo chapado, a maior fila de pixels idênticos
no miolo é de 7px, e o degradê usa 201 tons distintos em vez de 181.

Por cima ainda vai um chuvisco de ruído SVG a 7%, que é o mesmo truque do
*dither*: o que sobra de degrau some quando o ruído embaralha o último bit.
Custo zero de rede — é `data:` no próprio CSS.

**Mas o maior culpado é a foto.** O CSS já media limpo antes desta mudança. A
faixa que aparecia vinha do ciclorama da própria foto, não do véu. O prompt da
capa hoje pede o fundo liso de forma explícita — sem mancha, sem textura, sem
posterização — e é dali que vem a maior parte do ganho. **Todos os slides levam ao mesmo lugar:** página com um só destino
converte mais do que página que oferece três.

**Regras do giro automático.** Conteúdo que se move sozinho precisa de um
jeito de parar (WCAG 2.2.2). O giro para em quatro situações:

- botão *Pausar* na própria capa
- ponteiro em cima da capa
- foco do teclado dentro da capa
- aba do navegador escondida

Com `prefers-reduced-motion` ligado o giro nem começa, o botão de pausa some
por não ter o que pausar, e as setas continuam funcionando — quem não quer
movimento automático ainda pode navegar.

O slide escondido recebe `inert`, e não só `aria-hidden`. Só o `aria-hidden`
deixaria o botão dele alcançável pelo Tab dentro de um bloco que o leitor de
tela não anuncia.

## Movimento na capa

Cada slide aceita um `video` — um laço curto por cima da foto daquele slide. A foto continua
sendo o poster, então ela aparece primeiro e o vídeo entra em fade só quando
tem quadro pronto — nunca pisca preto.

O movimento é sempre opcional, em quatro sentidos:

- com `prefers-reduced-motion` ligado o vídeo **não chega a ser baixado**
  (esconder por CSS gastaria os dados de quem já disse que não quer movimento)
- se o navegador barrar o autoplay, o vídeo se remove e fica a foto
- se o arquivo falhar, idem
- com `video: null` naquele slide, idem

O laço deve ser quieto: tecido que balança, um respiro, uma aproximação lenta.
Corte, tremida ou zoom brusco brigam com o resto da página e chamam atenção
para si em vez de para a roupa.

## O logo de verdade

Hoje o cabeçalho **escreve** "feita assim" em DM Sans, o que é uma
aproximação. O certo é usar o arquivo. Exporte o logo em SVG ou PNG com
fundo transparente, salve ao lado do `index.html` e preencha:

```js
logo: "feita-assim.svg",
```

O site troca o texto pela imagem sozinho, no cabeçalho e no rodapé.

## O que a pesquisa de conversão mudou aqui

Três decisões da página vieram de dados, não de gosto:

**Sinal de confiança logo abaixo da capa.** Entrega, área atendida, troca e Pix
numa faixa fina, no ponto em que a dúvida aparece. Enterrado no rodapé, esse tipo
de informação não trabalha.

**Um destino só.** Os três slides da capa levam às peças. Página com um CTA
claro mede cerca de 13% mais conversão que página com vários competindo.

**Prova social: retirada por decisão da loja.** A pesquisa aponta avaliação
como o elemento de maior impacto da página — 92% das pessoas hesitam em
comprar quando não há nenhuma. A seção existiu, com a nota real do Google, e
foi removida a pedido. Fica registrado como o ponto mais frágil da página
hoje, e como o de retorno mais alto se voltar.

## Vitrines

Três blocos grandes de categoria **antes** da grade de peças. A ordem importa:
quem chega não quer ver 8 produtos em ordem aleatória, quer dizer o que veio
procurar. As vitrines fazem essa pergunta primeiro, e a grade responde logo
abaixo — filtrada, se a pessoa escolheu. É o módulo mais visual da página
depois da capa.

Cada bloco é **um botão, não um link**: ele não sai da página, ele filtra a
grade e sobe até ela. Ao filtrar, marca também a categoria no menu do topo,
para os dois não se contradizerem. Um atalho de verdade, não decoração.

Sem foto configurada, o bloco fica roxo chapado com a tulipa marcada d'água —
e o mesmo acontece se a foto falhar ao carregar. Nunca aparece imagem quebrada.

## Alvo de toque

Todo controle tem no mínimo **44×44px** de área tocável, em qualquer largura de
tela. Onde o desenho é menor que isso — os ícones sociais do rodapé têm 20px —
a área cresce por padding e margem negativa, sem mudar o que se vê.

O seletor de tamanho **não encolhe** no telefone pequeno. Se os tamanhos não
couberem na linha, eles quebram para a linha seguinte; quebrar é preferível a
apertar, porque é exatamente no telefone estreito que o erro de toque acontece,
e errar o toque em botão de compra é venda perdida.

Isso saiu de uma auditoria automática, não de olho: nenhuma captura de tela
mostra que um botão tem 34px de altura.

## Área de entrega

A loja entrega em **Criciúma e região**, e só. Isso aparece três vezes, de
propósito: na tarja do topo, na faixa de confiança e na legenda do primeiro
slide. Prometer envio para o Brasil inteiro traria pedido que a loja não
consegue atender — dizer o limite cedo custa menos que negar depois.

## Alinhamento do rodapé e da seção da loja

As duas últimas seções eram as mais desalinhadas da página, e o diagnóstico
saiu de medição, não de olho:

- as três colunas do rodapé mediam 525/375/375 e a primeira começava ~18px
  abaixo das outras, porque `.marca{min-height:44px}` valia também para o
  `<span>` do rodapé, onde não há nada para tocar. Hoje o alvo de 44px é só
  do `a.marca` do cabeçalho, as colunas são `repeat(3,1fr)` e todas
  compartilham o topo;
- cada linha das listas ocupava 61px em vez de 44, porque o `inline-flex` do
  link somava à entrelinha do `<li>`. O `<li>` virou a linha;
- a seção da loja era `1.15fr 1fr` e a coluna esquerda esticava para 406px
  com ~250px de vazio. Passou a `1fr 1fr` com `align-items:start`;
- o bloco legal virou uma linha por informação, **separadas por fio de ponta a
  ponta**: as três eram um parágrafo cinza único e ninguém achava o CNPJ nem o
  endereço. Cada linha carrega dois dados, um em cada ponta — razão social e
  copyright, rua e cidade —, e o fio atravessa o rodapé inteiro em vez de morrer
  no terço esquerdo, que era o que mais fazia o pé parecer torto. Na tela
  estreita os pares empilham e voltam a alinhar à esquerda. O aviso "Antes de
  publicar" ganhou tarja própria com fio rosa à esquerda — é recado para a loja,
  não dado para a cliente.

## Segurança

O site é um arquivo estático, sem servidor e sem banco. Isso apaga uma
categoria inteira de problema — não há SQL, não há sessão, não há senha para
vazar — e deixa outra bem viva: a página monta HTML por concatenação de texto,
e é aí que mora o risco. Quatro funções curtas, e tudo passa por uma delas.

| função | o que faz |
|---|---|
| `escapar` | `& < > " '` viram entidade, para texto não virar marcação |
| `urlSegura` | só http, https, mailto, tel e caminho relativo sobrevivem |
| `zapLink` | o telefone entra na URL só com dígitos |
| `sanear` | o carrinho volta do `localStorage` sem nada para acreditar |

**Por que `escapar` não bastava.** `javascript:alert(1)` não tem um único
caractere especial: passa limpo por qualquer escape e continua executando ao
clique. Todo `href` e todo `src` de valor configurável passa por `urlSegura`,
que também recusa `data:` e `//outro-host` — o segundo é protocolo herdado
disfarçado de caminho relativo.

**A parte mais importante: preço não vem do `localStorage`.** O carrinho é
guardado no navegador, que é editável por quem estiver nele, e o total do
carrinho é a mensagem que a loja recebe no WhatsApp. Se o preço guardado
fosse o preço usado, a cliente escolheria quanto pagar. Em vez disso `sanear`
descarta o que veio e busca **preço e nome de novo em `CONFIG.pecas`, pela
referência**. Junto com isso:

- referência que saiu do catálogo é descartada — e com ela a peça que a loja
  tirou do site;
- tamanho tem que estar entre os tamanhos daquela peça;
- quantidade é inteiro de 1 a 20, e o carrinho para em 40 linhas. Sem esse
  teto, um número enorme guardado ali travava a página só de desenhar.

Verificado com carrinho envenenado: nome com `<img onerror>` é substituído
pelo nome do catálogo, referência inexistente cai, tamanho inválido cai,
`qtd: 99999` vira 20, `qtd: "-5"` vira 1, e `preço 0,01` numa peça de R$ 139,90
volta a R$ 139,90.

**Content Security Policy.** Vai como `<meta>` no `<head>`: o navegador
bloqueia tudo que não estiver listado, inclusive script injetado. `script-src`
precisa de `'unsafe-inline'` porque o site é um arquivo só, com o JS dentro —
é a troca aceita para a dona editar o `CONFIG` sem recalcular hash. Em troca
`object-src`, `base-uri`, `frame-src`, `connect-src` e `form-action` estão
todos em `'none'`. Testado servindo por HTTP com a política ligada: zero
violação, e o carrinho, a busca e os filtros seguem funcionando.

Duas proteções não funcionam por `<meta>` e vivem no arquivo `_headers`
(Netlify, Cloudflare Pages): `frame-ancestors`/`X-Frame-Options`, contra a
loja ser embutida num iframe alheio, e `nosniff`. O GitHub Pages não deixa
configurar cabeçalho, então lá elas ficam de fora.

## Celular

O celular não é o desktop estreito — três coisas mudam de comportamento.

**O menu de categorias estava quebrado, e não era estética.** `.trilhos` tinha
`justify-content:center` dentro de um container com `overflow-x:auto`. Nessa
combinação o começo da lista fica **inalcançável por rolagem**: "TUDO" não
aparecia e "LOOKS" vinha cortado no meio, lido como "OOKS". Agora o trilho
começa na esquerda, sangra até as duas bordas e rola com encaixe.

**O véu da capa mudou de eixo.** No desktop ele escurece da esquerda para a
direita, porque o texto mora à esquerda e a modelo à direita. No celular o
texto fica *em cima* da modelo, e degradê lateral não protege nada — ali ele
sobe de baixo, que é onde o texto assenta. Mesma curva suave, outro eixo. O
texto também desce para o terço inferior, e as setas saem de cima do título
para a base, ao lado do botão de pausa.

**O cabeçalho continua grudado.** 99px de 844 — 12% da tela. Sem isso, quem
rolou até as peças não tem como voltar à sacola sem subir a página inteira, e
é aí que a venda se perde.

A altura da capa é `dvh`, não `vh`: no celular a barra de endereço entra e sai
durante a rolagem, e `vh` conta com ela — a capa mudava de altura no meio do
movimento.

Medido em 375, 390, 360, 768 e 844×390: zero rolagem horizontal, zero controle
abaixo de 44px, zero sobreposição entre controles clicáveis, corpo em 16px.

## O provador

Um avatar desenhado em SVG, montado a cada troca de peça. Não usa imagem
nenhuma: o corpo, a roupa e as bolsas são caminhos calculados na hora, o que
significa zero requisição de rede e nenhuma foto para manter.

**Por que desenho e não foto.** O que a cliente pediria de verdade é a roupa
sobre uma foto dela. Isso exige servidor e uma API de IA processando a imagem;
num arquivo estático a chave da API ficaria pública e qualquer pessoa gastaria
a conta da loja. Em vez de fingir, o provador mostra o que ele de fato sabe —
**a combinação**: cor, comprimento, proporção, o que fecha com o quê. E a
tela diz isso, com todas as letras, ao lado da figura.

Isso não é só honestidade defensiva. Provador que promete caimento e entrega
aproximação queima a confiança que a loja levou anos construindo, e a Feita
Assim tem provador de verdade a poucas quadras de quem compra. O desenho
manda para lá, com link.

**Três decisões que parecem detalhe e não são:**

| decisão | motivo |
|---|---|
| A figura é geométrica, não quase-realista | O "quase" viraria promessa. Ilustração assumida não mente. |
| Tom de pele é escolha da cliente | Cinco tons. Figura única e clara, numa loja brasileira, exclui a maior parte de quem compra. |
| Base neutra cinza nas vagas vazias | Sem ela, escolher só um casaco deixava o torso nu. Loja de roupa não vende casaco mostrando corpo nu. O cinza não é peça nenhuma do catálogo — é o manequim. |

**Como a loja acrescenta peça.** Dois campos no `CONFIG`, ao lado dos que já
existem:

- `molde` — qual desenho vestir. Hoje: `trico`, `camisa`, `calca-wide`,
  `calca-reta`, `saia`, `vestido`, `blazer`, `jaqueta`, `sobretudo`,
  `bolsa-ombro`, `bolsa-mao`, `oculos`. Peça sem molde não aparece no
  provador, e nada quebra.
- `cor` — a cor com que ela é desenhada. Use a cor real do tecido; se errar,
  o desenho mente sobre o produto.

Um molde novo é uma função a mais no objeto `MOLDES`, que recebe as medidas do
corpo e devolve SVG. As medidas vêm de um lugar só (`medidas()`), então peça
nova entra sem recalcular nada.

**Anatomia, e dois erros que valeram a pena consertar.** O braço descia em
`Ox-6` e a cintura ficava em `Cx`: sobravam 13px de fundo roxo na axila, que
liam como um corte na roupa. Hoje o braço desce colado ao corpo — ombro,
cotovelo na altura da cintura, pulso na altura do quadril —, e manga e braço
leem da mesma função, então nunca saem de registro. A linha do ombro também
tinha um recorte em degrau; virou curva contínua.

**Contorno em tudo.** Cada peça leva um traço de si mesma, escurecido a 80%.
Sem ele, tricô creme sobre pele clara — ou bolsa preta sobre jaqueta preta —
viram uma mancha só, e o desenho deixa de informar exatamente onde mais
importa.

**Tamanho.** O manequim escolhido é o tamanho que vai para o carrinho. Peça
numerada não tem P/M/G, então `CONFIG.provador.equivalencia` traduz — a mesma
tabela de medidas da loja — e o provador usa o primeiro número que a peça
realmente tem. O botão diz qual é antes de você apertar: *"Adicionar 5 peças
no tamanho M"*. Ninguém descobre o tamanho depois.

**Teclado e leitor de tela.** Tom de pele, altura e manequim são `radiogroup`
de verdade: as setas andam entre as opções, e só o item marcado fica no Tab.
O `<title>` do SVG é reescrito a cada troca e descreve o look inteiro —
*"Desenho de uma mulher, manequim G, vestindo: Tricô gola alta, Calça wide leg
jeans…"* —, então quem não vê a figura ouve o mesmo que ela mostra.

**No celular** a figura gruda logo abaixo do cabeçalho enquanto a cliente rola
os controles: escolher uma peça e não ver o efeito é o mesmo que não ter
provador. A nota explicativa ficou **fora** do bloco grudado — dentro dele,
comia metade da área útil.

## O provador na foto da cliente

Segundo modo do provador: a cliente escolhe uma foto de corpo inteiro, marca
onde estão os ombros e o chão, e as mesmas peças são desenhadas por cima —
no corpo dela, na escala dela.

**Por que isto foi possível sem reescrever nada.** Todo molde já lia a
geometria de `medidas()`. Bastou uma conta: as duas marcas dão a distância
ombro→chão na foto, isso vira a escala, e as peças entram num grupo
transformado. Nenhum molde precisou de uma linha nova para funcionar sobre
fotografia. Quando um sistema tem uma fonte única de medida, o segundo uso
sai quase de graça.

**Duas marcas, não sete.** A tentação era pedir ombro, cintura, quadril,
joelho, tornozelo. Cada ponto a mais é gente desistindo no meio. Duas marcas
e um controle de largura cobrem o que importa — altura e porte — e o resto
sai da proporção do molde. Elas também não são discos no meio do corpo: a
primeira versão era, e o disco tapava exatamente o rosto de quem estava se
vendo. Hoje são linhas de altura com a alça na borda da foto.

**A foto não sai do aparelho, e isso é verificável.** Não por promessa — por
construção, em três camadas:

1. Não existe no arquivo nenhuma linha que envie a imagem para lugar nenhum.
2. A CSP do `<head>` traz `connect-src 'none'` e `form-action 'none'`: o
   navegador **bloqueia** fetch, XHR, WebSocket e envio de formulário vindos
   desta página. Mesmo que alguém escrevesse o código de envio por engano,
   ele não sairia. Testado: um `fetch` POST para fora é recusado pela CSP.
3. Ela não vai para o `localStorage` nem para o `sessionStorage`. Foto de
   corpo inteiro guardada no navegador de um telefone que se empresta é risco
   de verdade, e conveniência nenhuma paga isso. "Trocar de foto" esvazia o
   SVG — só escondê-lo deixaria a imagem viva no DOM.

De quebra, a foto é redesenhada num `<canvas>` antes de ser usada. Isso
descarta os metadados do arquivo original, **inclusive a localização de onde
ela foi tirada**, que muita câmera de celular grava. E limita a 1400px no
maior lado, que é memória de sobra num celular.

**O que este modo não é.** Não é simulação de caimento, e a tela diz. As
peças são desenhos chapados por cima da imagem: mostram comprimento, cor e
proporção no corpo dela — que é a dúvida real de quem compra roupa online —
e não mostram como o tecido cai, franze ou marca. Isso continua sendo do
provador físico, e o texto ao lado da foto leva para lá.

Também depende da pose: foto de frente, em pé, braços ao lado do corpo. Com
a pessoa sentada ou de lado, as peças não encontram o corpo. O convite na
tela pede a pose certa antes de a cliente escolher o arquivo.

**HEIC.** Foto de iPhone costuma vir em HEIC, que o navegador não abre. Em
vez de falhar em silêncio, o erro diz o que fazer: abrir na galeria, duplicar
ou exportar como JPEG, e escolher o arquivo novo.

**Um tropeço que vale registrar.** `.prova__campo{display:grid}` vencia o
atributo `hidden`, e "Tom de pele" e "Altura" continuavam na tela no modo
foto — enquanto o bloco da foto aparecia no modo boneca. É o mesmo tropeço
que a barra do celular já deu neste arquivo: `display` declarado numa classe
ganha de `[hidden]`, e a correção é um seletor de atributo, que ganha na
especificidade e não depende da ordem.

## Realismo no provador: o que dá, o que não dá, e o que custa

A queixa foi justa — forma vetorial chapada sobre a foto lê como adesivo.
Vale registrar o que a pesquisa mostrou e por que o site parou onde parou.

**Como as empresas grandes fazem.** Google Shopping, Doji e Zalando usam
**modelos de difusão** treinados para entender caimento de tecido e geometria
do corpo. O Google roda um modelo próprio de geração de imagem sobre o
Shopping Graph; a Doji pede seis selfies e duas fotos de corpo inteiro e leva
cerca de meia hora para montar o avatar. Nenhum deles roda no navegador: é
GPU em servidor, sempre.

**Por que este site não pode fazer isso hoje.** O site é um arquivo estático
no GitHub Pages. Uma chave de API dentro dele é pública, e qualquer pessoa
gastaria a conta da loja. Try-on por difusão exige um intermediário no
servidor — e servidor é a única coisa que este projeto não tem.

**O que custaria.** As APIs de try-on cobram por imagem gerada: a FASHN v1.6
está em US$ 0,075 por geração e a Kolors v1.5 em US$ 0,07 — cerca de
**R$ 0,40 por prova**. Cem clientes provando três looks dão ~R$ 120 no mês. O
que falta não é o dinheiro, é o intermediário: um worker serverless
(Cloudflare Workers e Netlify Functions têm plano gratuito folgado) guardando
a chave e repassando a chamada. É meia tarde de trabalho, e passa a existir
uma peça de infraestrutura para manter.

**As duas melhorias que couberam sem servidor:**

1. **A luz da foto atravessa a roupa.** O que separa colagem de roupa vestida
   não é o contorno — é a luz. Numa foto real o corpo tem sombra sob o queixo,
   no vinco do braço, na dobra do joelho, e a peça desenhada não tinha
   nenhuma. Agora a própria foto é redesenhada por cima das peças em
   `multiply`, recortada pela silhueta delas, depois de passar por um filtro
   que tira a cor e comprime o contraste. Onde o corpo dela é escuro, o tecido
   escurece junto.

   A primeira tentativa comprimia pouco (`slope 0.62`) e o corpo dela ficava
   *carimbado* no casaco — tricô creme sobre pele escura virava cinza. Hoje a
   foto inteira é espremida entre 0,66 e 0,94: sobra a insinuação de volume, e
   a cor da peça continua sendo a cor da peça.

2. **A peça pode ser uma fotografia, não um desenho.** O campo `recorte` no
   `CONFIG` aponta para um PNG da peça com fundo transparente. Quando ele
   existe, a fotografia entra no lugar do vetor, na mesma caixa que o molde
   ocuparia — com trama, dobra e brilho do tecido real. Sem ele, ou se o
   arquivo falhar ao carregar, a peça volta a ser desenho e nada quebra.

   **É a melhoria de maior efeito, e não custa código: custa fotografia.** A
   loja vai fotografar as peças de qualquer jeito para a grade de produtos;
   basta uma tomada extra da peça sozinha, em fundo liso, recortada.

   A caixa é ancorada pela **altura** — ombro a bainha — e a largura sai da
   proporção do arquivo. Por isso o enquadramento importa: recorte folgado
   vira capa. A primeira versão deixava o `preserveAspectRatio` decidir, e o
   sobretudo encolhia para caber numa caixa estreita, virando colete.

**O que continua verdade.** Nem a luz nem a foto recortada simulam caimento.
Elas mostram comprimento, cor, textura e proporção no corpo dela — que é a
dúvida real de quem compra roupa online. Como o tecido cai, franze e marca
continua sendo do provador físico, e o texto ao lado da foto leva para lá.

## O tamanho certo

O que mais devolve peça numa loja a distância não é a cor errada — é o
tamanho. O provador passou a recomendar um, e por dois caminhos que não
inventam número.

**1. As medidas.** Busto, cintura e quadril caem na tabela da loja. É o
caminho preciso, e a tela pede quando a cliente quer certeza.

**2. O tamanho que ela já veste.** Sem fita métrica, o dado mais confiável
que existe é a experiência dela — e não custa nada.

**O que deliberadamente não existe aqui: estimar circunferência a partir de
altura e peso.** Dá para fazer a conta, e ela erra o suficiente para gerar
exatamente a troca que o recurso existe para evitar. Preferi pedir a medida
a chutar por ela.

**A modelagem da peça entra na conta.** `modelagem: "justa"` sobe um tamanho,
`"ampla"` mantém. Nunca desço sozinho: roupa apertada volta, roupa folgada
fica.

**A etiqueta mostra o tamanho que VAI PARA O CARRINHO, não o ideal teórico.**
Essa distinção custou um bug: a primeira versão recomendava GG na etiqueta e
mandava M para o carrinho, porque o blazer não tem GG e o código caía no
tamanho do meio da lista. Hoje `traduzir()` procura o vizinho subindo
primeiro, e quando o ideal não existe a etiqueta diz — "G, sem GG" — em vez
de fingir que deu certo.

A tradução para numeração também precisou de cuidado: 40 **é** o G da calça,
não um tamanho diferente. Sem marcar isso, a calça aparecia como "sem G"
tendo exatamente o tamanho pedido.

**A tabela vem preenchida e marcada como não conferida.** Os números são a
referência do mercado brasileiro, não as medidas das peças da loja. Enquanto
`conferida` for `false`, o rodapé avisa a dona e a recomendação sai com a
ressalva na tela. Recomendar tamanho errado é pior do que não recomendar.

## O avatar do Minimal Club, e por que ele não cabe aqui

O pedido foi o fluxo do Minimal Club: três ou quatro fotos do rosto, e um
avatar fotorrealista de corpo inteiro vestindo o look. Vale registrar por que
o site não faz isso, para ninguém tentar de novo pelo caminho errado.

Gerar um corpo com o rosto de uma pessoa a partir de selfies é **difusão com
identidade preservada** — GPU em servidor, sempre. A Doji pede seis selfies e
duas fotos de corpo inteiro e leva meia hora para montar o avatar; o Google
roda um modelo próprio. Nenhum roda no navegador, e uma chave de API dentro
de um arquivo estático é pública.

**Por isso o site não pede as fotos do rosto.** Coletar rosto é coletar dado
biométrico; fazer isso sem ter o que entregar em troca não se justifica em
nenhuma leitura. O dia em que existir o intermediário no servidor, o fluxo de
captura se escreve em uma tarde — e aí ele terá para que servir.

## O provador com IA, e o servidor que ele exigiu

O try-on de verdade — a peça vestida no corpo dela, com caimento — roda em
GPU, em servidor. Não havia como fugir disso, e agora existe o servidor: um
worker do Cloudflare, na pasta `servidor/`.

**Por que um intermediário e não a chamada direta.** O site é estático. Uma
chave de API dentro dele é pública, e qualquer pessoa gastaria a conta da
loja. O worker guarda a chave; o site nunca a vê.

**O controle que de fato importa é o teto de gasto, não o CORS.** O endereço
do worker é público — tem de ser, o site é público — e CORS só vale dentro do
navegador: quem chamar por fora não manda origem nenhuma. Por isso a defesa
real é um contador diário global que corta tudo ao chegar no limite, mais um
teto por IP. Sem eles, uma noite de abuso vira uma fatura de milhares.

Três outras travas, todas testadas com a API simulada:

- **A peça só pode vir de um host autorizado.** Sem isso o endereço público
  viraria um gerador de try-on de graça para qualquer imagem da internet, na
  conta da loja.
- **O contador sobe antes de a API ser chamada**, não depois. Se a API demora
  e a pessoa insiste, o teto continua valendo.
- **A foto entra com limite de tamanho e de tipo**, e nunca é gravada nem
  registrada em log.

### O que muda na privacidade, e não dá para disfarçar

Enquanto o provador era só desenho, a foto não saía do aparelho, e a CSP com
`connect-src 'none'` garantia isso **por construção** — não por promessa.

**Com a IA ligada isso deixa de ser verdade em um caminho.** A foto vai para a
empresa que roda o modelo, fora do Brasil. O site trata isso assim:

- **Consentimento explícito antes do primeiro envio**, numa caixa que diz o
  que vai, para onde, e o que a loja recebe (nada). Isso não é gentileza: é
  obrigação da LGPD, e a loja é a controladora.
- **O consentimento não é guardado.** Vale pela sessão. Guardá-lo num
  navegador que se empresta seria consentir pela próxima pessoa.
- **Os textos da tela mudam sozinhos.** Com a IA desligada, o site promete que
  a foto não sai. Com ela ligada, o mesmo lugar passa a dizer que sai se ela
  pedir. Promessa que não acompanha o código vira mentira na primeira semana.

### A trava que também é um freio

Ligar a IA exige **duas** mudanças: o endereço no `CONFIG` e o `connect-src`
na CSP. Esquecer a segunda faz o navegador bloquear a chamada — e isso é de
propósito. É a mesma trava que hoje garante que a foto não sai; ela só cede
quando alguém decide, por escrito, que vai ceder.

Quando isso acontece, a mensagem na tela diz exatamente o que consertar. Foi
o primeiro caso que o teste pegou, e ficou como teste permanente.

## A passada adversarial

Depois de tudo pronto, o site inteiro passou por um ataque deliberado — cada
entrada recebeu payload, e o sucesso era **nada acontecer**. Servido por HTTP,
com a CSP valendo de verdade.

O que foi atacado e resistiu: a busca, os três campos de medida, o nome do
arquivo da foto, o hash da URL, o `localStorage` do carrinho (payload no nome
da peça, preço de R$ 0,01), script externo injetado à força, `fetch` de
exfiltração, e o `CONFIG` envenenado — cor de peça com `"><img onerror=...>`
e tom de pele com `url(javascript:1)`.

O último item derrubou a última exceção da página: **cor entrava crua em
atributo de SVG**. Era dado do dono da loja, mas a regra é que nada entra em
atributo sem passar por uma função de segurança — agora existe `corSegura()`,
que só deixa passar `#RGB`, `#RRGGBB` ou `#RRGGBBAA` e devolve um neutro para
o resto. Uma aspa numa cor não sai mais do atributo.

No worker, dois aparafusos: `X-Content-Type-Options: nosniff` em toda
resposta, e o `Content-Length` conferido **antes** do parse do corpo — sem
isso, um corpo de dezenas de megabytes seria lido inteiro só para ser
recusado depois, CPU gasta a mando de quem ataca.

O teste também registra, de propósito, o limite que fica: script inline
pós-carga roda, porque `script-src 'unsafe-inline'` é a troca declarada para
a dona editar o `CONFIG` sem build. O que a CSP garante mesmo assim: código
de fora não carrega, e dado não sai — os dois testes que transformariam uma
injeção em roubo falham para o atacante.

## A mudança para a Vercel, e o que ela destravou

O site saiu do GitHub Pages e foi para a Vercel. Duas coisas que não davam lá
passaram a dar:

**Cabeçalhos de segurança de verdade.** O `vercel.json` aplica o que o `<meta>`
nunca conseguiu: `frame-ancestors 'none'` e `X-Frame-Options` contra a loja ser
embutida em iframe alheio, `nosniff`, HSTS com preload, `Permissions-Policy`
fechando câmera, microfone, localização e pagamento, e as duas políticas de
isolamento de origem. O `_headers` do Netlify continua no repositório para o
caso de a hospedagem mudar de novo.

**O intermediário da IA mora no mesmo site.** `api/provar.js` sobe junto com o
`index.html` — sem segunda conta, sem `wrangler`, sem comando. E por morar no
mesmo domínio, a CSP ficou em `connect-src 'self'` em vez de precisar liberar
um endereço de fora. Isso é melhor do que parece: some a categoria inteira de
"para onde mais esta página consegue mandar dado".

**O endpoint vem vazio, e é de propósito.** Ligar é uma linha, mas ela é o
último passo do LEIA-ME. Com o botão no ar e a função sem chave, a cliente
consentiria em mandar a foto dela para fora e receberia um erro — consentimento
gasto à toa é pior do que botão nenhum. Virou teste: "função sem chave: a
cliente recebe explicação, não silêncio".

**Sobre o teto de gasto, uma correção de honestidade.** Na Vercel o contador
por hora só é rígido com Upstash configurado; sem ele, cada instância quente da
função tem o seu. O LEIA-ME agora diz isso com todas as letras e aponta o teto
que não falha: **o saldo pré-pago na FASHN**. Ele não depende de nenhuma linha
deste código estar certa.

## O provador no formato do Minimal Club

A referência que a loja mandou tem uma hierarquia clara: a figura no meio,
grande; o nome das peças do look logo abaixo; e prateleiras de categoria
rolando por baixo. O provador estava em duas colunas — figura de um lado,
painel de controles do outro —, o que fazia dela metade de um formulário.

O que mudou:

- **Uma coluna só, em qualquer largura.** A figura fica centrada com respiro
  dos dois lados, e isso a faz parecer o assunto da página.
- **"O seu look"**, com os nomes das peças em linha sob a figura. Quando não há
  nada escolhido, a linha convida em vez de sumir — bloco que aparece e some
  faz a página pular.
- **Prateleiras horizontais** por categoria, com a contagem ao lado do título.
  Em vez de uma lista que cresce para baixo e empurra o botão de comprar para
  fora da tela, cada faixa cabe numa linha e rola com o dedo.
- **Os ajustes de corpo ficaram recolhidos** num `<details>` com resumo na aba
  ("clara · 1,60–1,70 · veste M"). No modo foto ele abre sozinho, porque ali
  ele deixa de ser opcional.

### A armadilha do grid, três vezes na mesma tarde

`grid-template-columns: 1fr` é `minmax(auto, 1fr)`, e o mínimo `auto` é o
**min-content do filho**. Qualquer filho que sangre para fora — uma prateleira
com margem negativa, um painel com campos que não encolhem — estica a coluna
para além da tela.

Aconteceu três vezes seguidas, em três grids diferentes do provador, com o
mesmo sintoma: no celular a seção inteira saía deslocada para a direita e
cortada. A regra ficou escrita no CSS: **todo grid daqui que contenha algo
rolável ou sangrado leva `minmax(0,1fr)`, e os filhos levam `min-width:0`.**

### Dois erros dos meus próprios testes

Enquanto caçava isso, dois testes mentiram e precisaram ser consertados:

1. Mediam `window.innerWidth` para achar o centro da tela. Sob emulação de
   celular esse valor pode ser o do viewport visual, não o de layout — e o
   teste acusou descentralização onde não havia. Agora usam
   `documentElement.clientWidth`.
2. Contavam como vazamento qualquer elemento que passasse da borda direita.
   Mas passar da borda **dentro de um container com overflow** é o desenho:
   a prateleira que rola, a capa com zoom, a gaveta fechada. O ruído escondia
   os vazamentos de verdade. Agora o teste sobe a árvore e ignora quem está
   dentro de algo que rola ou esconde.

## O avatar a partir do rosto — o que a referência realmente pedia

A loja mandou o print do Minimal Club duas vezes, e na segunda ficou claro o
que eu não tinha entendido: **o problema não era a fidelidade do desenho, era
o desenho existir.** Peça vetorial sobre foto lê como adesivo, por melhor que
seja o contorno, a luz e a textura. A frase foi direta — "não fica legal ali
nas peças".

E o fluxo certo era o oposto do que eu tinha construído: **a cliente não manda
foto de corpo inteiro, manda fotos do rosto**, e o sistema monta o corpo.

### Como ficou

Duas etapas, duas gerações pagas:

1. **`face-to-model`** — de uma a quatro fotos do rosto viram uma pessoa de
   corpo inteiro, com a identidade preservada. Uma vez por cliente.
2. **`tryon-v1.6`** — a peça é vestida nesse corpo. Uma por peça provada.

O avatar é criado **uma vez e reaproveitado**. Refazer o corpo a cada peça
dobraria a conta sem melhorar nada, e cada passada de IA degrada a imagem —
por isso a peça é sempre vestida no avatar limpo, nunca no resultado anterior.
Empilhar três provas deixaria o rosto irreconhecível.

Escolher uma peça já dispara a prova: com o avatar montado, pedir mais um
toque é atrito sem motivo.

### O que foi removido, e por quê

Todo o modo "peças desenhadas sobre a sua foto" saiu do arquivo: as duas
marcas arrastáveis, a escala derivada delas, a camada de luz em `multiply`, o
controle de largura e o suporte a peça recortada sobre foto. Cerca de 200
linhas.

Não foi só limpeza. **Enquanto a IA estiver desligada, o modo avatar não
aparece** — o botão fica escondido e clicar nele devolve para a boneca. É uma
decisão de produto: melhor não oferecer do que oferecer a versão que a dona já
recusou. E foto de rosto é dado biométrico; pedir isso sem ter o que entregar
não se justifica.

### Privacidade: a régua subiu

Antes eram fotos de corpo, agora são fotos de **rosto**. O consentimento mudou
de texto e abre com a frase que importa: *"Foto de rosto é dado do seu corpo.
Pense antes, como você pensaria antes de mandar para um desconhecido."*

O que continua garantido e testado: escolher a foto não envia nada; recusar o
consentimento não envia nada; as fotos não vão para `localStorage` nem
`sessionStorage`; "Trocar as fotos" apaga o avatar e as miniaturas do DOM, não
só esconde; e sai apenas a foto e a peça — nada do pedido, do nome ou do
telefone.

### As janelas do rosto, e um erro de arquitetura que elas revelaram

Quatro janelas circulares, com o rótulo **fora** do círculo (dentro, "Olhando
para cima" saía cortado). Só a de frente é obrigatória: exigir as quatro faria
muita gente desistir na terceira, e uma já produz avatar.

A primeira versão remontava o HTML inteiro a cada foto escolhida. Isso recriava
os `<input>`, e com eles: o foco se perdia no meio do preenchimento, e um campo
já preenchido deixava de existir enquanto a pessoa ainda mexia nele. Agora as
janelas são montadas uma vez e só repintadas — `montarRostos()` monta,
`pintarJanelas()` atualiza.

Trocar qualquer foto derruba o avatar antigo. Mostrar o avatar anterior ao lado
de fotos novas seria dizer que ele veio delas.
