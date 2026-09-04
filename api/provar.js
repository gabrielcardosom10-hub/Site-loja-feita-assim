/**
 * Provador com IA — intermediário, versão Vercel.
 *
 * Por que existe: o site é estático. Uma chave de API dentro dele é pública,
 * e qualquer pessoa gastaria a conta da loja. Esta função fica no meio: ela
 * guarda a chave, e o navegador nunca a vê.
 *
 * Sobe junto com o site. Não há comando para rodar, não há segunda conta:
 * basta pôr FASHN_KEY nas variáveis de ambiente do projeto na Vercel.
 *
 * SOBRE O TETO DE GASTO — leia antes de ligar.
 * O endereço é público, e tem de ser. Existem dois tetos aqui:
 *   • O de verdade é o SALDO PRÉ-PAGO na FASHN. Ele não depende de nada
 *     deste código estar certo, e é o único que não falha.
 *   • O daqui é por hora e por IP. Com Upstash configurado ele é rígido e
 *     compartilhado; sem Upstash ele vale só dentro de cada instância quente
 *     da função — ajuda contra rajada, não substitui o saldo.
 * Não confie no segundo para proteger o bolso. Compre crédito limitado.
 */

const MAX_FOTO = 6 * 1024 * 1024;
const MAX_ROSTOS = 4;

/* Dois modelos, duas etapas:
   1. face-to-model  — as fotos do rosto viram uma pessoa de corpo, com a
      identidade preservada. É o passo que faltava para o provador parecer a
      referência: sem ele o look é colado; com ele o look é vestido.
   2. tryon-v1.6     — a peça é vestida nessa pessoa.
   O avatar é criado UMA vez e reaproveitado em todas as provas — cada
   geração é paga, e refazer o corpo a cada peça dobraria a conta à toa.

   Os nomes ficam configuráveis porque a API do fornecedor muda de versão
   sem avisar, e trocar um nome não pode exigir mexer em código. */
const MODELO_AVATAR = process.env.MODELO_AVATAR || "face-to-model";
const MODELO_TRYON  = process.env.MODELO_TRYON  || "tryon-v1.6";

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

/* ── a API de try-on ────────────────────────────────────────── */
async function chamar(caminho, opcoes){
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
  if(!process.env.FASHN_KEY)
    return res.status(503).json({erro: "sem chave", mensagem:
      "O provador com IA ainda não foi configurado. Falta FASHN_KEY nas variáveis de ambiente."});
  if(origem && permitidas.length && !liberada)
    return res.status(403).json({erro: "origem não autorizada"});

  /* ── consultar um pedido em andamento ── */
  if(req.method === "GET"){
    const id = String((req.query && req.query.id) || "");
    /* letras, números, _ e -: barra travessia de caminho e injeção na URL */
    if(!/^[A-Za-z0-9_-]{4,100}$/.test(id))
      return res.status(400).json({erro: "identificador inválido"});
    const r = await chamar("/status/" + encodeURIComponent(id), {method: "GET"});
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
  const tetoHora = Number(process.env.TETO_HORA || 20);
  const tetoIp   = Number(process.env.TETO_IP   || 6);

  const geral = await somar("prova:h:" + hora, 3900);
  if(geral.n > tetoHora)
    return res.status(429).json({erro: "teto da hora", mensagem:
      "O provador com IA está muito procurado agora. Tente daqui a pouco."});

  const pessoal = await somar("prova:ip:" + hora + ":" + ip, 3900);
  if(pessoal.n > tetoIp)
    return res.status(429).json({erro: "teto por pessoa", mensagem:
      "Você já provou " + tetoIp + " vezes nesta hora. Descanse um pouco, ou fale com a loja no WhatsApp."});

  /* ── entrada ── */
  const corpo = req.body && typeof req.body === "object" ? req.body : {};
  const acao = corpo.acao === "avatar" ? "avatar" : "provar";

  const ehImagem = v => /^data:image\/(jpeg|png|webp);base64,/.test(String(v || ""));

  /* ── etapa 1: as fotos do rosto viram um corpo ── */
  if(acao === "avatar"){
    const rostos = Array.isArray(corpo.rostos) ? corpo.rostos.slice(0, MAX_ROSTOS) : [];
    if(!rostos.length || !rostos.every(ehImagem))
      return res.status(400).json({erro: "mande de 1 a 4 fotos do rosto, em JPEG, PNG ou WEBP"});
    if(rostos.some(f => String(f).length > MAX_FOTO))
      return res.status(413).json({erro: "foto muito grande", mensagem: "Escolha fotos menores."});

    /* A primeira é a de frente, e é ela que manda na identidade. As outras
       vão como referência: se esta versão da API não aceitar mais de uma,
       o erro dela volta inteiro e a tela pede só a de frente. */
    const entradas = {face_image: rostos[0]};
    if(rostos.length > 1) entradas.face_reference_images = rostos.slice(1);
    if(corpo.aspecto) entradas.aspect_ratio = String(corpo.aspecto).slice(0, 10);

    const r = await chamar("/run", {
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
    return res.status(202).json({id: r.corpo.id, etapa: "avatar", tetoRigido: geral.rigido});
  }

  /* ── etapa 2: vestir a peça no corpo ── */
  const foto = String(corpo.foto || "");
  const peca = String(corpo.peca || "");
  const categoria = ["tops","bottoms","one-pieces","auto"].includes(corpo.categoria)
    ? corpo.categoria : "auto";

  /* o corpo pode ser o avatar recém-criado (uma URL do próprio fornecedor)
     ou uma foto que a cliente mandou */
  const fotoEhUrl = /^https:\/\//.test(foto);
  if(!ehImagem(foto) && !fotoEhUrl)
    return res.status(400).json({erro: "a foto precisa ser JPEG, PNG ou WEBP"});
  if(foto.length > MAX_FOTO)
    return res.status(413).json({erro: "foto muito grande", mensagem: "Escolha uma foto menor."});

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
     na conta da loja. */
  if(!daLista(peca)) return res.status(400).json({erro: "a peça não é de um endereço autorizado"});
  /* E o corpo, quando é URL, só pode ser um avatar que a própria API gerou */
  if(fotoEhUrl && !daLista(foto, ["fashn.ai","cdn.fashn.ai"]))
    return res.status(400).json({erro: "o corpo não é de um endereço autorizado"});

  const r = await chamar("/run", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      model_name: MODELO_TRYON,
      inputs: {model_image: foto, garment_image: peca, category: categoria}
    })
  });
  if(!r.ok) return res.status(502).json({erro: r.corpo.error || r.corpo.message || ("a API respondeu " + r.status)});
  if(!r.corpo.id) return res.status(502).json({erro: "a API não devolveu um identificador"});
  return res.status(202).json({id: r.corpo.id, etapa: "provar", tetoRigido: geral.rigido});
}

/* O corpo chega em JSON e pode ser grande: a foto vem como data URI. */
export const config = {api: {bodyParser: {sizeLimit: "8mb"}}};
