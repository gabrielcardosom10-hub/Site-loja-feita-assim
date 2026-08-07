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
em `.08em`/`.09em` e a legenda desceu para caixa baixa em `.04em`. Quem chama
atenção na capa é o título; a interface em volta não deve disputar.

**Chuvisco sobre o roxo.** O véu da capa é um degradê grande de ameixa, e área
grande de degradê em tela de 8 bits aparece em faixas. Uma textura de ruído SVG
a 5% de opacidade por cima quebra a transição e o olho volta a ler cor lisa.
Custo zero de rede: é `data:` no próprio CSS. **Todos os slides levam ao mesmo lugar:** página com um só destino
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

Três blocos grandes de categoria entre as peças e a seção da loja. É o módulo
mais visual da página depois da capa, e é o que grandes lojas de roupa põem
nessa posição.

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
- o bloco legal virou uma linha por informação, e o aviso "Antes de publicar"
  ganhou tarja própria com fio rosa à esquerda — é recado para a loja, não
  dado para a cliente.
