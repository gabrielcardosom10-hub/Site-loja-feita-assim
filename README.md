# Feita Assim

Site da Feita Assim — loja de roupas, bolsas, óculos e acessórios femininos
na Praça Dr. Nereu Ramos, 358 — loja 02 — Centro, Criciúma/SC.

**No ar em:** https://gabrielcardosom10-hub.github.io/Site-loja-feita-assim/

## O que é cada arquivo

| arquivo | para que serve |
|---|---|
| `index.html` | o site inteiro: HTML, CSS e JavaScript num arquivo só |
| `fotos/` | as fotos das peças. `LEIA-ME.md` tem a tabela de nomes |
| `DESIGN.md` | o sistema visual, a segurança e as decisões de celular |
| `_headers` | cabeçalhos de segurança (Netlify e Cloudflare; o Pages ignora) |
| `.nojekyll` | desliga o Jekyll, para o Pages servir os arquivos como estão |

## Como mudar preço, peça, foto ou contato

Tudo o que a loja precisa editar está num bloco só: procure por `const CONFIG`
dentro do `index.html`. Não é preciso mexer em CSS nem em JavaScript.

Para trocar a foto de uma peça, salve o arquivo em `fotos/` com o nome da
referência — `FA-1001.jpg`, por exemplo. O site prefere o arquivo local
automaticamente, sem nenhuma edição.

## Falta preencher

O rodapé mostra um aviso em rosa enquanto estes campos estiverem com valor
de exemplo, em `CONFIG`:

- `whatsapp` — hoje `5548000000000`
- `telefone` — hoje `(48) 0000-0000`
- `cnpj` — hoje `00.000.000/0001-00`
