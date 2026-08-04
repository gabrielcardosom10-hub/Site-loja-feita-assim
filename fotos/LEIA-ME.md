# Como pôr as fotos no site

Salve os arquivos nesta pasta com o nome exato da tabela abaixo e pronto —
o site acha sozinho. Não é preciso editar o `index.html`.

## Importante: não baixe do Instagram

O Instagram recomprime toda foto que você publica. As **originais do seu
celular** são bem melhores. Use elas.

## Fotos das peças

As peças hoje no site estão com **fotos provisórias geradas por IA**, para
você ver o layout de pé. Substitua salvando a sua com o código da peça — o
arquivo local vence a provisória automaticamente. Uma foto por peça:

| arquivo a salvar | peça | referência |
|---|---|---|
| `fotos/FA-1001.jpg` | Calça wide leg jeans | FA-1001 |
| `fotos/FA-1002.jpg` | Blazer de alfaiataria off-white | FA-1002 |
| `fotos/FA-1003.jpg` | Jaqueta de couro preta | FA-1003 |
| `fotos/FA-1004.jpg` | Tricô gola alta | FA-1004 |
| `fotos/FA-1005.jpg` | Sobretudo longo | FA-1005 |
| `fotos/FA-3001.jpg` | Bolsa de ombro em couro caramelo | FA-3001 |
| `fotos/FA-3002.jpg` | Bolsa estruturada preta | FA-3002 |
| `fotos/FA-2001.jpg` | Óculos solar retangular | FA-2001 |

Se faltar alguma, a peça mostra um lugar em branco desenhado de propósito —
não quebra nada, e você pode ir preenchendo aos poucos.

### Como tirar

- **Formato:** retrato, mais alta do que larga. O site corta em 4:5.
- **Fundo:** o mesmo para todas. Uma parede lisa e clara já resolve.
- **Luz:** perto de uma janela, sem sol direto, sem flash.
- **Enquadramento:** a peça inteira, com folga em volta. O corte é feito depois.
- **Tamanho:** cerca de 1200px de largura. Acima disso só deixa a página lenta.

O que mais muda o resultado é a repetição: mesma parede, mesma luz, mesma
distância em todas. É isso que faz uma grade de produtos parecer profissional.

## Fotos do Instagram

Para a seção "No Instagram" no fim da página, salve as escolhidas como
`fotos/insta-1.jpg`, `insta-2.jpg` e assim por diante, e liste em
`CONFIG.instagram_fotos`, no `index.html`, com o link do post de cada uma:

```js
instagram_fotos: [
  {foto:"fotos/insta-1.jpg", post:"https://www.instagram.com/p/XXXX/", alt:"Vestido midi na loja"},
  {foto:"fotos/insta-2.jpg", post:"https://www.instagram.com/p/YYYY/", alt:"Bolsa baguette"},
],
```

Essas são quadradas, cortadas em 1:1.

## Foto da abertura

A imagem grande do topo fica em `CONFIG.abertura.foto`. Hoje aponta para uma
imagem provisória hospedada fora. Salve a sua como `fotos/abertura.jpg` e
troque o valor. Ela funciona melhor deitada, com a peça de um lado e espaço
vazio do outro — é sobre o vazio que o texto se assenta.

## Como enviar os arquivos

Pelo site do GitHub, sem instalar nada:

1. Abra o repositório e entre na pasta `fotos`
2. **Add file → Upload files**
3. Arraste as fotos
4. **Commit changes**
