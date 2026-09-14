# Painel de Comando

Ferramenta pessoal de execução: rotina, tarefas, hábitos, finanças, metas,
escrita e faculdade num lugar só. Roda inteira no navegador, sem servidor,
sem conta, sem mensalidade.

**No ar em:** `/sistema/` do próprio site — por exemplo
`https://gabrielcardosom10-hub.github.io/Site-loja-feita-assim/sistema/`

## Como usar — o ciclo que faz a ferramenta funcionar

| quando | o que fazer | leva |
|---|---|---|
| **toda manhã** | abrir em **Hoje**, escolher **as 3 do dia**, conferir a rotina | 2 min |
| **durante o dia** | marcar hábito, bloco de rotina e tarefa assim que terminar | segundos |
| **toda noite** | escrever em **Escrita** e lançar os gastos do dia | 5 min |
| **todo domingo** | abrir **Revisão**, responder as três perguntas e definir o foco | 15 min |

Se você só fizer a parte da manhã e a do domingo, a ferramenta já paga o
tempo que custa. O resto é ganho.

## As nove telas

| tela | para que serve |
|---|---|
| **Hoje** | painel do dia: placar, as 3 prioridades, rotina, hábitos, contagem de dias limpos e a escrita rápida |
| **Tarefas** | tudo que está aberto, agrupado por prazo. Atrasado aparece primeiro, em vermelho |
| **Rotina** | blocos fixos por período e dia da semana. O que você não decide de novo todo dia |
| **Hábitos** | construir (ofensiva, meta semanal, 30 dias) e largar (dias limpos, recorde, gatilhos, vontades vencidas) |
| **Finanças** | entradas, saídas, saldo, teto por categoria, objetivos de dinheiro e seis meses de histórico |
| **Metas** | metas com prazo, o porquê e marcos que dá para marcar. Meta sem marco é desejo |
| **Escrita** | um texto por dia, com estímulo, vitória, lição, gratidão, humor e energia |
| **Faculdade** | notas com peso, média, faltas com alerta de limite, entregas e tempo de estudo |
| **Revisão** | placar médio da semana, números fechados e as três perguntas do domingo |
| **Dados** | cópia de segurança, restauração, tema e limpeza |

## Como o placar do dia é calculado

Vai de 0 a 100 e só conta o que existe no seu painel — se você não cadastrou
hábito nenhum, o peso dos hábitos some e os outros crescem.

| parte | peso |
|---|---|
| as 3 do dia concluídas | 30 |
| hábitos marcados | 25 |
| blocos de rotina cumpridos | 22 |
| escrita do dia | 13 |
| nenhuma recaída registrada | 10 |

Verde a partir de 75, amarelo de 45 a 74, vermelho abaixo de 45.

## Onde os dados ficam

No **próprio aparelho**, no `localStorage` do navegador. Nada é enviado para
lugar nenhum. Consequência prática: o painel do celular e o do computador são
dois painéis diferentes.

Quando a mesma página está publicada como Artifact do Claude, ela também
sincroniza numa base na nuvem da sua conta — aí celular e computador ficam
iguais sozinhos.

**Faça a cópia de segurança.** Em *Dados* → *Baixar cópia (.json)*. Limpar os
dados do navegador apaga tudo, e não há como recuperar sem a cópia.

## Arquivos

| arquivo | para que serve |
|---|---|
| `index.html` | a casca da página: fontes e os dois arquivos abaixo |
| `estilo.css` | sistema visual — cores, tipos e componentes, claro e escuro |
| `app.js` | a ferramenta inteira: estado, cálculos, telas e ações |

Para mexer no conteúdo pronto da primeira abertura, procure a função
`padrao()` dentro do `app.js`. É de onde saem os exemplos.
