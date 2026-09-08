/**
 * Provador com IA — intermediário, versão Vercel.
 *
 * Por que existe: o site é estático. Uma chave de API dentro dele é pública,
 * e qualquer pessoa gastaria a conta da loja. Esta função fica no meio: ela
 * guarda a chave, e o navegador nunca a vê.
 *
 * DOIS MOTORES, ESCOLHIDOS SOZINHOS PELA CHAVE QUE EXISTIR
 * ──────────────────────────────────────────────────────────
 * Não tem variável de "qual motor usar" para configurar. Põe UMA chave nas
 * variáveis de ambiente da Vercel, e é ela que decide:
 *
 *   OPENROUTER_KEY  → motor "openrouter", chama um modelo de imagem do
 *                      Google (Gemini) através da OpenRouter.
 *   FASHN_KEY       → motor "fashn", o caminho original — um modelo feito
 *                      especificamente para vestir roupa em gente.
 *
 * Se as duas existirem, a OpenRouter ganha (é a mais nova das duas e a que
 * a loja está usando agora). Nenhuma das duas é obrigatória: sem chave
 * nenhuma, este arquivo nem entra em cena — o provador de graça (o rosto
 * dela sobre o corpo desenhado) continua sendo o padrão.
 *
 * A DIFERENÇA QUE IMPORTA ENTRE OS DOIS, E QUE NINGUÉM CONTA DE GRAÇA:
 * a FASHN foi treinada para UMA coisa — vestir roupa em pessoa, preservando
 * pose e identidade. A OpenRouter aqui chama um modelo GERAL de imagem, que
 * entende a instrução em texto ("vista esta pessoa com esta roupa") mas não
 * foi feito só para isso. Na etapa 2 (vestir a peça) o resultado costuma
 * ficar bom — é o caso de uso que o modelo mais treina. Na etapa 1 (montar
 * o corpo inteiro a partir só do rosto) é um pedido mais difícil para um
 * modelo geral, e o resultado varia mais de foto para foto. Se a loja notar
 * isso, o ajuste é no texto de PROMPT_AVATAR aqui embaixo — não é código
 * que precisa mudar, é o pedido que precisa ficar mais claro.
 *
 * SOBRE O TETO DE GASTO — leia antes de ligar.
 * O endereço é público, e tem de ser. Existem três tetos aqui, e eles não
 * fazem o mesmo trabalho:
 *   • TETO_MES é o do BOLSO. Ele conta as imagens geradas no mês e para
 *     quando chega no número que a loja escolheu. É o único que responde à
 *     pergunta "quanto isso pode me custar até o dia 30".
 *   • TETO_HORA e TETO_IP são contra RAJADA, não contra conta alta: seguram
 *     um pico e um abusador, e zeram a cada hora.
 *   • O de verdade, que não depende de nada deste código estar certo, é o
 *     SALDO PRÉ-PAGO no fornecedor (créditos na OpenRouter, ou saldo na
 *     FASHN). Compre limitado. Sempre, com qualquer um dos dois.
 *
 * Com Upstash configurado os três são rígidos e compartilhados entre as
 * instâncias. SEM Upstash cada instância quente tem o seu contador, e aí
 * TETO_MES vira estimativa, não trava — para um teto de bolso que valha o
 * nome, configure o Upstash (o plano de graça dá conta com folga).
 *
 * QUANDO QUALQUER TETO ESTOURA, a resposta vem com "cair": true. O site lê
 * esse sinal e cai sozinho no provador de graça — o rosto da cliente sobre
 * o corpo desenhado. Ninguém vê erro; o provador só fica menos bonito até
 * o mês virar.
 */

const MAX_FOTO = 6 * 1024 * 1024;
const MAX_ROSTOS = 4;

/* ── qual motor está ligado ──────────────────────────────────────
   Uma função, não uma constante: lida a cada pedido, porque variável de
   ambiente pode mudar entre um deploy e outro sem o processo reiniciar em
   todo lugar (a Vercel garante isso por invocação, mas custa nada checar
   toda vez em vez de confiar numa constante congelada na primeira leitura). */
function motorLigado(){
  if(process.env.OPENROUTER_KEY) return "openrouter";
  if(process.env.FASHN_KEY) return "fashn";
  return null;
}

/* ── FASHN: dois modelos, duas etapas ─────────────────────────────
   1. face-to-model  — as fotos do rosto viram uma pessoa de corpo, com a
      identidade preservada.
   2. tryon-v1.6     — a peça é vestida nessa pessoa.
   O avatar é criado UMA vez e reaproveitado em todas as provas — cada
   geração é paga, e refazer o corpo a cada peça dobraria a conta à toa.

   Os nomes ficam configuráveis porque a API do fornecedor muda de versão
   sem avisar, e trocar um nome não pode exigir mexer em código. */
const MODELO_AVATAR = process.env.MODELO_AVATAR || "face-to-model";
const MODELO_TRYON  = process.env.MODELO_TRYON  || "tryon-v1.6";

/* ── OpenRouter: um modelo só, chamado duas vezes com pedidos diferentes ──
   "google/gemini-3.1-flash-image" é a versão de setembro de 2026 — a
   anterior (gemini-2.5-flash-image) para de funcionar em outubro de 2026,
   então o padrão aqui já pula para a que continua no ar. Se um dia isso
   mudar de novo, é só trocar a variável de ambiente, sem mexer em código —
   mesma ideia do MODELO_AVATAR acima. */
const OPENROUTER_MODELO = process.env.OPENROUTER_MODELO || "google/gemini-3.1-flash-image";

/* Os pedidos vão em inglês de propósito: é a língua em que estes modelos
   seguem instrução de edição de imagem com mais precisão — funciona em
   qualquer idioma, mas erra menos assim. O texto do produto (nome da peça)
   nunca é digitado pela cliente, vem do catálogo da loja: não é entrada de
   estranho indo para dentro do pedido. */
const PROMPT_AVATAR =
  "Using the attached face photo(s) as the only reference, generate one " +
  "photorealistic, full-body photo of this exact same person. Preserve " +
  "their real face, skin tone, and hair exactly as shown in the reference " +
  "— do not change their identity, age, or facial features. Standing pose, " +
  "facing the camera, arms relaxed at their sides, plain light gray studio " +
  "background, soft even lighting, wearing simple fitted neutral-colored " +
  "clothing. Photographic quality, not an illustration, not a 3D render.";

const promptTryon = (nome, categoria) =>
  "The first image is a photo of a person. The second image is a clothing " +
  "product photo (" + (nome ? nome.slice(0,80) + ", " : "") + "category: " +
  categoria + "). Edit the first photo so this exact person is wearing the " +
  "garment from the second image, replacing whatever they currently wear in " +
  "that part of the body. Keep the person's face, body shape, pose, skin " +
  "tone, hair, and background exactly the same — change only the clothing. " +
  "Match the garment's real color, pattern, and fabric texture. " +
  "Photorealistic result, natural fit and folds, realistic shadows.";

/* ── contadores ─────────────────────────────────────────────────
   Upstash quando existir; memória da instância quando não. A memória é
   honestamente fraca em serverless — cada instância tem a sua — e por isso
   o aviso acima. */
const memoria = new Map();

async function somar(chave, ttlSegundos){
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if(url && tok){
    try{
      const r = await fetch(url + "/incr/" + encodeURIComponent(chave), {
        headers: {Authorization: "Bearer " + tok}
      });
      const d = await r.json();
      const n = Number(d.result) || 1;
      if(n === 1) await fetch(url + "/expire/" + encodeURIComponent(chave) + "/" + ttlSegundos,
        {headers: {Authorization: "Bearer " + tok}});
      return {n, rigido: true};
    }catch(e){ /* Upstash fora do ar não derruba a loja: cai na memória */ }
  }
  const agora = Date.now();
  const reg = memoria.get(chave);
  if(!reg || reg.ate < agora){
    memoria.set(chave, {n: 1, ate: agora + ttlSegundos*1000});
    return {n: 1, rigido: false};
  }
  reg.n++;
  return {n: reg.n, rigido: false};
}

/* Lê um contador SEM somar. A saúde precisa disto: perguntar "o mês já
   estourou?" não pode gastar uma unidade do próprio teto. */
async function ler(chave){
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if(url && tok){
    try{
      const r = await fetch(url + "/get/" + encodeURIComponent(chave), {
        headers: {Authorization: "Bearer " + tok}
      });
      const d = await r.json();
      return {n: Number(d.result) || 0, rigido: true};
    }catch(e){ /* cai na memória */ }
  }
  const reg = memoria.get(chave);
  return {n: reg && reg.ate > Date.now() ? reg.n : 0, rigido: false};
}

const mesAgora = () => new Date().toISOString().slice(0, 7);   /* AAAA-MM */
const MES_EM_SEGUNDOS = 32 * 24 * 3600;

/* ── a API da FASHN ─────────────────────────────────────────── */
async function chamarFashn(caminho, opcoes){
  const r = await fetch("https://api.fashn.ai/v1" + caminho, {
    ...opcoes,
    headers: {
      ...(opcoes && opcoes.headers),
      Authorization: "Bearer " + process.env.FASHN_KEY
    }
  });
  const corpo = await r.json().catch(() => ({}));
  return {ok: r.ok, status: r.status, corpo};
}

/* ── a API da OpenRouter ────────────────────────────────────────
   Uma chamada só, sem fila: o modelo devolve a imagem na mesma resposta.
   Isso é mais simples que a FASHN (que pede um id e é preciso perguntar de
   novo até ficar pronta) — e é por isso que esta função não tem uma irmã
   "consultar", como a FASHN tem via /status. */
async function chamarOpenRouter(partesDoConteudo){
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.OPENROUTER_KEY,
      /* a OpenRouter recomenda estes dois para identificar quem chama —
         não são segredo, e ajudam se um dia for preciso falar com o
         suporte deles sobre uso da conta */
      "HTTP-Referer": ((process.env.ORIGENS || "").split(",")[0] || "").trim() || "https://openrouter.ai",
      "X-Title": "Feita Assim"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODELO,
      modalities: ["image", "text"],
      messages: [{role: "user", content: partesDoConteudo}]
    })
  });
  const corpo = await r.json().catch(() => ({}));
  return {ok: r.ok, status: r.status, corpo};
}

/* A resposta pode trazer a imagem em mais de um formato — a OpenRouter
   repassa modelos de fornecedores diferentes, e o formato exato de
   "imagem dentro da resposta de chat" ainda está se firmando entre eles.
   Em vez de apostar num formato só e quebrar quando ele mudar, esta função
   procura nos lugares conhecidos e usa o primeiro que achar. */
function imagemDaRespostaOpenRouter(corpo){
  const msg = corpo && corpo.choices && corpo.choices[0] && corpo.choices[0].message;
  if(!msg) return null;
  if(Array.isArray(msg.images) && msg.images.length){
    const im = msg.images[0];
    const url = (im && im.image_url && im.image_url.url) || (im && im.url);
    if(url) return url;
  }
  if(Array.isArray(msg.content)){
    const parte = msg.content.find(p => p && p.type === "image_url" && p.image_url && p.image_url.url);
    if(parte) return parte.image_url.url;
  }
  return null;
}

/* ── entrada ────────────────────────────────────────────────── */
export default async function handler(req, res){
  const permitidas = (process.env.ORIGENS || "").split(",").map(s => s.trim()).filter(Boolean);
  const origem = req.headers.origin;
  const liberada = !permitidas.length || (origem && permitidas.includes(origem));

  res.setHeader("Access-Control-Allow-Origin", liberada && origem ? origem : (permitidas[0] || "null"));
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if(req.method === "OPTIONS") return res.status(204).end();
  if(origem && permitidas.length && !liberada)
    return res.status(403).json({erro: "origem não autorizada"});

  const tetoMes  = Number(process.env.TETO_MES  || 200);
  const tetoHora = Number(process.env.TETO_HORA || 20);
  const tetoIp   = Number(process.env.TETO_IP   || 6);
  const motor = motorLigado();

  /* ── saúde: GET sem identificador ───────────────────────────
     O site pergunta isto UMA vez, quando a cliente abre o provador, e só
     mostra o caminho da IA se a resposta disser que ele está de pé. É o
     que evita o pior desenho possível: pedir para ela consentir em mandar
     o rosto para fora, e depois responder com erro porque faltava a chave
     ou porque o mês já tinha estourado. Consentimento gasto à toa é pior
     do que botão nenhum.

     Não sai daqui número de uso, nem nada da chave, nem qual motor está
     ligado: o endereço é público, e "quanto a loja já gastou" ou "com quem
     ela contratou" não é assunto de quem passa na rua. */
  if(req.method === "GET" && !(req.query && req.query.id)){
    const ligado = !!motor;
    const mes = ligado ? await ler("prova:m:" + mesAgora()) : {n: 0, rigido: false};
    return res.status(200).json({
      saude: true,
      ligado,
      pausado: ligado && mes.n >= tetoMes,
      tetoRigido: mes.rigido
    });
  }

  if(!motor)
    return res.status(503).json({erro: "sem chave", cair: true, mensagem:
      "O provador com IA ainda não foi configurado. Falta OPENROUTER_KEY " +
      "ou FASHN_KEY nas variáveis de ambiente."});

  /* ── consultar um pedido em andamento ──────────────────────────
     Só existe fila do lado da FASHN. A OpenRouter devolve a imagem na
     hora, na própria resposta do POST — então um pedido feito por esse
     motor nunca chega aqui com um id para consultar. */
  if(req.method === "GET"){
    if(motor !== "fashn")
      return res.status(400).json({erro: "este motor não usa consulta por identificador"});
    const id = String((req.query && req.query.id) || "");
    /* letras, números, _ e -: barra travessia de caminho e injeção na URL */
    if(!/^[A-Za-z0-9_-]{4,100}$/.test(id))
      return res.status(400).json({erro: "identificador inválido"});
    const r = await chamarFashn("/status/" + encodeURIComponent(id), {method: "GET"});
    if(!r.ok) return res.status(502).json({erro: r.corpo.error || ("a API respondeu " + r.status)});
    const c = r.corpo;
    return res.status(200).json({
      estado: c.status,
      imagem: Array.isArray(c.output) && c.output.length ? c.output[0] : null,
      erro: c.status === "failed"
        ? ((c.error && (c.error.message || c.error.name)) || "a geração falhou") : null
    });
  }

  if(req.method !== "POST") return res.status(405).json({erro: "método não aceito"});

  /* ── limites, antes de qualquer trabalho ── */
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "sem-ip";
  const hora = new Date().toISOString().slice(0, 13);   /* AAAA-MM-DDThh */

  /* O teto do mês é lido, não somado, aqui: quem soma é o despacho, lá
     embaixo, depois de a geração ter sido de fato pedida. Somar antes faria
     pedido inválido e ataque queimarem o teto do BOLSO da loja — e é para
     isso que existem os dois tetos de rajada, que somam sempre. */
  const mes = await ler("prova:m:" + mesAgora());
  if(mes.n >= tetoMes)
    return res.status(429).json({erro: "teto do mês", cair: true, mensagem:
      "O provador com inteligência artificial já bateu o limite deste mês."});

  const geral = await somar("prova:h:" + hora, 3900);
  if(geral.n > tetoHora)
    return res.status(429).json({erro: "teto da hora", cair: true, mensagem:
      "O provador com IA está muito procurado agora. Tente daqui a pouco."});

  const pessoal = await somar("prova:ip:" + hora + ":" + ip, 3900);
  if(pessoal.n > tetoIp)
    return res.status(429).json({erro: "teto por pessoa", cair: true, mensagem:
      "Você já provou " + tetoIp + " vezes nesta hora. Descanse um pouco, ou fale com a loja no WhatsApp."});

  /* ── entrada ── */
  const corpo = req.body && typeof req.body === "object" ? req.body : {};
  const acao = corpo.acao === "avatar" ? "avatar" : "provar";

  const ehImagem = v => /^data:image\/(jpeg|png|webp);base64,/.test(String(v || ""));

  /* marca a geração como gasta — só é chamada depois que o fornecedor já
     aceitou o pedido, nunca antes: pedido inválido não pode queimar teto */
  const marcarGasto = () => somar("prova:m:" + mesAgora(), MES_EM_SEGUNDOS);

  /* ── etapa 1: as fotos do rosto viram um corpo ── */
  if(acao === "avatar"){
    const rostos = Array.isArray(corpo.rostos) ? corpo.rostos.slice(0, MAX_ROSTOS) : [];
    if(!rostos.length || !rostos.every(ehImagem))
      return res.status(400).json({erro: "mande de 1 a 4 fotos do rosto, em JPEG, PNG ou WEBP"});
    if(rostos.some(f => String(f).length > MAX_FOTO))
      return res.status(413).json({erro: "foto muito grande", mensagem: "Escolha fotos menores."});

    if(motor === "openrouter"){
      const r = await chamarOpenRouter([
        {type: "text", text: PROMPT_AVATAR},
        ...rostos.map(url => ({type: "image_url", image_url: {url}}))
      ]);
      if(!r.ok) return res.status(502).json({
        erro: (r.corpo.error && r.corpo.error.message) || ("a API respondeu " + r.status),
        modelo: OPENROUTER_MODELO
      });
      const imagem = imagemDaRespostaOpenRouter(r.corpo);
      if(!imagem) return res.status(502).json({
        erro: "a IA não devolveu uma imagem — pode ter recusado o pedido " +
              "por segurança. Tente fotos diferentes.",
        modelo: OPENROUTER_MODELO
      });
      const gasto = await marcarGasto();
      /* estado "completed" já na resposta do POST: não existe id para
         consultar depois, e o site sabe disso (resultadoIA() no cliente
         usa a imagem na hora quando ela já vem pronta) */
      return res.status(202).json({estado: "completed", imagem, etapa: "avatar",
        tetoRigido: geral.rigido && gasto.rigido, doMes: gasto.n, tetoMes});
    }

    /* motor === "fashn" ─────────────────────────────────────────
       A primeira foto é a de frente, e é ela que manda na identidade. As
       outras vão como referência: se esta versão da API não aceitar mais
       de uma, o erro dela volta inteiro e a tela pede só a de frente. */
    const entradas = {face_image: rostos[0]};
    if(rostos.length > 1) entradas.face_reference_images = rostos.slice(1);
    if(corpo.aspecto) entradas.aspect_ratio = String(corpo.aspecto).slice(0, 10);

    const r = await chamarFashn("/run", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({model_name: MODELO_AVATAR, inputs: entradas})
    });
    if(!r.ok) return res.status(502).json({
      erro: r.corpo.error || r.corpo.message || ("a API respondeu " + r.status),
      /* o nome do modelo vai junto para a loja saber o que ajustar quando a
         API mudar de versão */
      modelo: MODELO_AVATAR
    });
    if(!r.corpo.id) return res.status(502).json({erro: "a API não devolveu um identificador"});
    /* só aqui virou dinheiro: a geração foi aceita pelo fornecedor */
    const gasto = await marcarGasto();
    return res.status(202).json({id: r.corpo.id, etapa: "avatar",
      tetoRigido: geral.rigido && gasto.rigido, doMes: gasto.n, tetoMes});
  }

  /* ── etapa 2: vestir a peça no corpo ── */
  const foto = String(corpo.foto || "");
  const peca = String(corpo.peca || "");
  const categoria = ["tops","bottoms","one-pieces","auto"].includes(corpo.categoria)
    ? corpo.categoria : "auto";
  const nomePeca = typeof corpo.nomePeca === "string" ? corpo.nomePeca.slice(0, 80) : "";

  const hosts = (process.env.HOSTS_PECA || "").split(",").map(s => s.trim()).filter(Boolean);
  const daLista = (endereco, extras) => {
    try{
      const u = new URL(endereco);
      return u.protocol === "https:" &&
        (hosts.concat(extras || [])).some(h => u.hostname === h || u.hostname.endsWith("." + h));
    }catch(e){ return false; }
  };
  /* A peça só pode vir de endereço autorizado. Sem isto, o endereço público
     viraria um gerador de try-on de graça para qualquer imagem da internet,
     na conta da loja. Vale para os dois motores. */
  if(!daLista(peca)) return res.status(400).json({erro: "a peça não é de um endereço autorizado"});
  if(foto.length > MAX_FOTO)
    return res.status(413).json({erro: "foto muito grande", mensagem: "Escolha uma foto menor."});

  if(motor === "openrouter"){
    /* Com a OpenRouter o corpo nunca é uma URL: o avatar que a etapa 1
       devolveu já veio como data URI (a OpenRouter não hospeda a imagem
       em lugar nenhum, devolve os bytes na própria resposta), e a foto
       que a cliente manda direto também é data URI. Uma URL aqui não tem
       explicação boa — é recusada, não adivinhada. */
    if(!ehImagem(foto))
      return res.status(400).json({erro: "a foto precisa ser JPEG, PNG ou WEBP"});

    const r = await chamarOpenRouter([
      {type: "text", text: promptTryon(nomePeca, categoria)},
      {type: "image_url", image_url: {url: foto}},
      {type: "image_url", image_url: {url: peca}}
    ]);
    if(!r.ok) return res.status(502).json({
      erro: (r.corpo.error && r.corpo.error.message) || ("a API respondeu " + r.status),
      modelo: OPENROUTER_MODELO
    });
    const imagem = imagemDaRespostaOpenRouter(r.corpo);
    if(!imagem) return res.status(502).json({
      erro: "a IA não devolveu uma imagem — pode ter recusado o pedido " +
            "por segurança. Tente outra peça, ou monte o avatar de novo.",
      modelo: OPENROUTER_MODELO
    });
    const gasto = await marcarGasto();
    return res.status(202).json({estado: "completed", imagem, etapa: "provar",
      tetoRigido: geral.rigido && gasto.rigido, doMes: gasto.n, tetoMes});
  }

  /* motor === "fashn" ─────────────────────────────────────────────
     o corpo pode ser o avatar recém-criado (uma URL do próprio fornecedor)
     ou uma foto que a cliente mandou */
  const fotoEhUrl = /^https:\/\//.test(foto);
  if(!ehImagem(foto) && !fotoEhUrl)
    return res.status(400).json({erro: "a foto precisa ser JPEG, PNG ou WEBP"});
  /* e o corpo, quando é URL, só pode ser um avatar que a própria API gerou */
  if(fotoEhUrl && !daLista(foto, ["fashn.ai","cdn.fashn.ai"]))
    return res.status(400).json({erro: "o corpo não é de um endereço autorizado"});

  const r = await chamarFashn("/run", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      model_name: MODELO_TRYON,
      inputs: {model_image: foto, garment_image: peca, category: categoria}
    })
  });
  if(!r.ok) return res.status(502).json({erro: r.corpo.error || r.corpo.message || ("a API respondeu " + r.status)});
  if(!r.corpo.id) return res.status(502).json({erro: "a API não devolveu um identificador"});
  const gasto = await marcarGasto();
  return res.status(202).json({id: r.corpo.id, etapa: "provar",
    tetoRigido: geral.rigido && gasto.rigido, doMes: gasto.n, tetoMes});
}

/* O corpo chega em JSON e pode ser grande: a foto vem como data URI. */
export const config = {api: {bodyParser: {sizeLimit: "8mb"}}};

/* A OpenRouter responde numa chamada só, sem fila — mas gerar imagem ainda
   leva alguns segundos, e o padrão da Vercel (sem isto) é curto demais para
   isso terminar com folga. 45s cobre com sobra sem chegar perto do teto do
   plano Hobby (60s sem Fluid Compute, 300s com). */
export const maxDuration = 45;
