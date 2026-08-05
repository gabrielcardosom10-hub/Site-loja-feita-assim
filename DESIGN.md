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
| `--tinta` | `#33153B` | ameixa escura: texto e fundos fechados |
| `--ameixa` | `#4A1157` | o roxo do logo: superfícies |
| `--rosa` | `#FF2D7A` | o magenta da tulipa: só em tipo grande |
| `--rosa-forte` | `#CC1A64` | o mesmo magenta fechado: botões e links |
| `--papel` | `#F7F3F5` | off-white morno: o fundo da página |
| `--cal` | `#FFFFFF` | branco das fotos e do bilhete |
| `--lilas` | `#CDBBD6` | texto secundário sobre roxo |
| `--rosa-claro` | `#FFA8C8` | magenta claro sobre roxo |
| `--cinza` | `#6E5C77` | texto secundário sobre papel |

**Por que dois rosas.** O magenta vivo tem menos de 4,5:1 sobre papel — passa em
título grande, reprova em texto corrido. `--rosa-forte` é o mesmo tom
fechado até 5,0:1, e é ele que vai em botão, link e preço.

**Onde o roxo entra.** Três lugares, não mais: a tarja do topo, a seção da
loja e o rodapé. O miolo é claro e a fotografia manda.

## Tipografia

**Poppins** no corpo e na interface, **Bodoni Moda** só no título da capa.

A serifada de alto contraste aparece em um lugar e nada mais. Ela dá a
elegância que a moda pede sem disputar com o logo, que é de caixa baixa
arredondada — contraste é diferente de conflito, desde que cada uma tenha
seu território.

| papel | tratamento |
|---|---|
| Título da capa | Bodoni Moda, caixa alta, 2ª linha em itálico rosa |
| Display | Poppins 600, caixa baixa, entreletras −0.03em |
| Subtítulo do display | 300, caixa baixa |
| Corpo | 400, 16px, altura 1.6 |
| Interface | 12px, 600, caixa alta, entreletras +0.09em |

A caixa alta vive na camada de interface — menu, botões, etiquetas, selos —
e no título da capa, onde a serifada a sustenta. Os demais títulos ficam em
caixa baixa, na voz do logo.

> A escolha da Poppins é uma inferência a partir da imagem do logo, que é
> pequena demais para identificar a fonte com certeza. Se o logo usa outra,
> troque em `--display` e `--corpo`, no topo do CSS.

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
linhas — a segunda em itálico rosa —, legenda entreletrada e botão vazado.

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

Hoje o cabeçalho **escreve** "feita assim" em Poppins, o que é uma
aproximação. O certo é usar o arquivo. Exporte o logo em SVG ou PNG com
fundo transparente, salve ao lado do `index.html` e preencha:

```js
logo: "feita-assim.svg",
```

O site troca o texto pela imagem sozinho, no cabeçalho e no rodapé.
