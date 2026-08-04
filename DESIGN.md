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
| `--ameixa` | `#3E1A46` | o roxo do logo: superfícies |
| `--rosa` | `#E23C7E` | o magenta da tulipa: só em tipo grande |
| `--rosa-forte` | `#C42566` | o mesmo magenta fechado: botões e links |
| `--papel` | `#F7F3F5` | off-white morno: o fundo da página |
| `--cal` | `#FFFFFF` | branco das fotos e do bilhete |
| `--lilas` | `#CDBBD6` | texto secundário sobre roxo |
| `--rosa-claro` | `#FFA8C8` | magenta claro sobre roxo |
| `--cinza` | `#6E5C77` | texto secundário sobre papel |

**Por que dois rosas.** O magenta do logo tem 4,0:1 sobre papel — passa em
título grande, reprova em texto corrido. `--rosa-forte` é o mesmo tom
fechado até 5,0:1, e é ele que vai em botão, link e preço.

**Onde o roxo entra.** Três lugares, não mais: a tarja do topo, a seção da
loja e o rodapé. O miolo é claro e a fotografia manda.

## Tipografia

**Poppins**, uma família em dois papéis.

| papel | tratamento |
|---|---|
| Display | 600, caixa baixa, entreletras −0.03em |
| Subtítulo do display | 300, caixa baixa |
| Corpo | 400, 16px, altura 1.6 |
| Interface | 12px, 600, caixa alta, entreletras +0.09em |

A caixa alta vive **só na camada de interface** — menu, botões, etiquetas,
selos. Título nenhum é caixa alta: isso brigaria com o logo.

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

## O logo de verdade

Hoje o cabeçalho **escreve** "feita assim" em Poppins, o que é uma
aproximação. O certo é usar o arquivo. Exporte o logo em SVG ou PNG com
fundo transparente, salve ao lado do `index.html` e preencha:

```js
logo: "feita-assim.svg",
```

O site troca o texto pela imagem sozinho, no cabeçalho e no rodapé.
