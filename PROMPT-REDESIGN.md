# Prompt para redesenhar o site da Feita Assim

Cole o texto abaixo junto com o arquivo HTML atual do site.

---

Você é o diretor de design de um estúdio pequeno, contratado porque a cliente já
recusou propostas que pareciam template. Ela está pagando por um ponto de vista.

## A cliente

Feita Assim — loja de roupas, bolsas, óculos de sol e acessórios femininos em
Criciúma, Santa Catarina. Loja física de rua, com uma dona que atende as clientes
pelo nome. Vende também por envio para o Brasil inteiro.

O que é verdade sobre o negócio, e precisa aparecer no design:

- **Não existe checkout.** A venda inteira acontece numa conversa de WhatsApp:
  a cliente monta a sacola, manda a lista, e a loja confirma estoque, frete e
  pagamento conversando. Isso não é uma limitação técnica a ser escondida — é
  como a loja vende, e é o motivo de as clientes voltarem.
- **Compra poucas peças de cada modelo.** Quem comprou não encontra a mesma
  roupa na cidade inteira.
- **Entrega no mesmo dia em Criciúma** para pedidos até as 15h.
- **Tem provador físico e agenda visita.** Dá pra marcar hora e experimentar.
- **Pix com 5% de desconto, cartão em até 3x sem juros.**
- Marca: tulipa como símbolo, roxo escuro e rosa. Tagline atual: "Te ajudamos a
  ganhar o mundo do seu jeito".
- Instagram é onde as clientes já seguem a loja.

Público: mulheres da região, que compram olhando o Instagram e decidem no
WhatsApp. Elas conhecem a loja ou conhecem alguém que conhece.

## O trabalho

Redesenhar a página inicial inteira. Quero um site que pareça feito **para esta
loja**, por alguém que esteve dentro dela — não uma vitrine genérica com o logo
trocado.

O código atual funciona; o problema é que ele é indistinguível de qualquer outra
loja virtual brasileira. Você pode reescrever a estrutura, o CSS e o layout à
vontade. Preserve as funções que já existem (sacola, monta pedido no WhatsApp,
busca, menu, avisos), mas não preserve a aparência delas.

## O que está entregando "feito por IA", e precisa morrer

Não conserte estes itens — remova a lógica que os produz.

1. **O esqueleto de template.** Barra de avisos rotativa no topo, header com
   busca em pill, mega menu de categorias, carrossel de banner, tarja de três
   vantagens com ícone à esquerda, prateleiras em grade de 4 colunas, banner
   duplo lado a lado, newsletter em faixa escura, rodapé de quatro colunas —
   nessa ordem. É a estrutura padrão de plataforma de e-commerce. Escolha uma
   arquitetura de página que faça sentido para o que esta loja vende e para como
   ela vende, e justifique cada seção que mantiver.

2. **Urgência inventada.** O contador do "Achadinho da semana" recalcula o prazo
   final a cada carregamento da página — é um relógio que nunca chega a zero.
   Tire. Se houver promoção com prazo real, a data é fixa e escrita à mão; se
   não houver, a seção não existe. O mesmo vale para o campo `vendidas` como
   prova social e para qualquer selo de escassez sem estoque real por trás.

3. **Modo demonstração.** Fotos do Unsplash, tags "demo" nos cards e a faixa
   fixa no rodapé avisando que é rascunho. Nada disso pode existir no
   entregável. Onde ainda não há foto real do produto, projete um estado vazio
   que seja bonito de propósito e que a loja não tenha vergonha de publicar.

4. **A tipografia.** Fraunces como display + Space Mono em eyebrows caixa alta é,
   hoje, a assinatura visual mais reconhecível de página gerada por IA. Escolha
   outro par, e escolha por um motivo ligado a roupa, a Criciúma ou ao jeito
   desta loja falar. Defina uma escala tipográfica de verdade, com pesos e
   espaçamentos intencionais. A tipografia deve ser uma das coisas memoráveis da
   página, não um veículo neutro.

5. **O card genérico.** Retângulo com borda de 1px, sombra e `translateY(-3px)`
   no hover, repetido em produto, avaliação e banner. Todo elemento tem o mesmo
   raio de borda e o mesmo gap de 18px. Diferencie por hierarquia real.

6. **A bolinha verde do WhatsApp no canto.** É o elemento mais template do site
   inteiro, e ironicamente representa o que a loja tem de mais próprio. Projete a
   conversa como parte da experiência de compra, não como um botão flutuante
   comprado pronto.

7. **Conteúdo de mentira.** "Rua Exemplo, 123", CNPJ `00.000.000/0001-00`,
   WhatsApp `5548000000000`, nomes de produto de catálogo de fornecedor. Deixe
   marcado de forma inequívoca o que a dona precisa preencher, num único lugar,
   e nunca invente depoimento de cliente.

## Regras inegociáveis

- Nenhum número, prazo, avaliação ou selo que não corresponda a um fato.
- A cliente precisa conseguir trocar preço, produto, foto e contato sem mexer em
  CSS. Mantenha um bloco de configuração único, comentado em português claro.
- Um arquivo HTML autocontido, como é hoje. Sem framework, sem build.

## Direção de design

Não vou escolher a estética por você — essa é a parte pela qual você foi
contratado. Mas três direções estão proibidas, porque são o que sai por padrão
hoje e aparecem independentemente do assunto:

- fundo creme (~#F4F1EA) com serifada de alto contraste e acento terracota;
- fundo quase preto com um único acento verde-limão ou vermelho vivo;
- layout de jornal, com fios finos, raio zero e colunas densas.

O roxo e o rosa da marca ficam. O que você faz com eles é decisão sua — hoje
estão aplicados como blocos chapados em quatro faixas da página, o que é a
escolha mais óbvia possível.

Gaste ousadia em um lugar só. Escolha um elemento de assinatura que resuma a
loja, execute-o muito bem, e mantenha todo o resto quieto e disciplinado.

## Processo obrigatório

Antes de escrever qualquer linha de código, me entregue um plano curto:

- **Cor:** de 4 a 6 hex com nome, e o papel de cada um.
- **Tipografia:** as famílias para display, corpo e utilidade, com o motivo da
  escolha.
- **Layout:** a arquitetura da página em prosa, com um wireframe em ASCII.
- **Assinatura:** o único elemento pelo qual esta página vai ser lembrada.
- **Texto:** as três frases mais importantes da página, escritas de verdade.

Depois, revise o próprio plano: se alguma parte é o que você produziria para
qualquer loja de roupa, troque essa parte e me diga o que mudou e por quê. Só
comece o código depois disso.

## Piso de qualidade

Responsivo até 360px de largura. Foco de teclado visível. `prefers-reduced-motion`
respeitado. Contraste AA no texto. As fotos de produto são o conteúdo mais
pesado da página — carregue-as com `loading="lazy"` e proporção reservada, para a
página não pular enquanto carrega.

## Sobre o texto

Escreva a cópia como quem atende. Verbo ativo, frase curta, nada de frase de
efeito vazia. O botão diz o que acontece quando é apertado, e a confirmação usa a
mesma palavra do botão. Erro explica o que fazer em seguida. Seção vazia é
convite, não desculpa.

Uma correção: a frase atual da newsletter, "Avisamos quando a peça que você quer
entrar na loja", está quebrada. Reescreva-a.
