#!/usr/bin/env python3
"""Junta index.html + estilo.css + app.js num arquivo único: painel.html.

Rode depois de mexer no CSS ou no JS, para as duas versões não divergirem:

    python3 sistema/montar.py
"""
import io
import os

AQUI = os.path.dirname(os.path.abspath(__file__))


def ler(nome):
    with io.open(os.path.join(AQUI, nome), encoding='utf-8') as f:
        return f.read()


css = ler('estilo.css')
js = ler('app.js')

# defesa: uma dessas sequências dentro do conteúdo fecharia a tag antes da hora
css = css.replace('</style', '<\\/style')
js = js.replace('</script', '<\\/script')

pagina = ler('index.html')
pagina = pagina.replace(
    '<link rel="stylesheet" href="estilo.css">',
    '<style>\n' + css + '\n</style>'
)
pagina = pagina.replace(
    '<script src="app.js"></script>',
    '<script>\n' + js + '\n</script>'
)
pagina = pagina.replace(
    '<title>Painel de Comando</title>',
    '<title>Painel de Comando</title>\n<!-- Arquivo único, gerado por montar.py. '
    'Edite estilo.css e app.js, depois rode o script de novo. -->'
)

destino = os.path.join(AQUI, 'painel.html')
with io.open(destino, 'w', encoding='utf-8') as f:
    f.write(pagina)

print('painel.html gerado — %.0f KB' % (len(pagina.encode('utf-8')) / 1024))
