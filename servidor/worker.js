/**
 * Provador com IA da Feita Assim — intermediário.
 *
 * POR QUE ISTO EXISTE
 * O site é um arquivo estático. Uma chave de API dentro dele é pública, e
 * qualquer pessoa gastaria a conta da loja. Este worker fica no meio: ele
 * guarda a chave, e o site nunca a vê.
 *
 * O QUE ELE PROTEGE, EM ORDEM DE IMPORTÂNCIA
 *  1. O dinheiro. O endereço é público — tem de ser, o site é público. A
 *     defesa que de fato segura a conta não é o CORS, é o TETO DIÁRIO: um
 *     contador global que corta tudo ao chegar no limite. Sem ele, uma noite
 *     de abuso vira uma fatura de milhares.
 *  2. A chave. Vive como secret do Cloudflare, nunca no código.
 *  3. A imagem. Não é guardada, não é registrada em log, não é reenviada
 *     para lugar nenhum além da API de try-on.
 *
 * O QUE ELE NÃO PROTEGE
 * Um endereço público chamado por curl. CORS só vale dentro do navegador.
 * Por isso o teto e o limite por IP são os controles que importam.
 */

const MAX_FOTO = 6 * 1024 * 1024;      /* 6 MB de data URI já é foto grande */
const MODELO   = "tryon-v1.6";

/* ── respostas ───────────────────────────────────────────────── */
function cors(env, origem){
  const permitidas = (env.ORIGENS || "").split(",").map(s => s.trim()).filter(Boolean);
  const ok = origem && permitidas.includes(origem);
  return {
    "Access-Control-Allow-Origin": ok ? origem : permitidas[0] || "null",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
const json = (dados, status, cab) => new Response(JSON.stringify(dados), {
  status: status || 200,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...cab
  }
});

/* ── contadores ──────────────────────────────────────────────── */
/* O dia vira a chave: no fim do dia a contagem some sozinha por TTL, e não
   há nada para limpar. */
const hoje = () => new Date().toISOString().slice(0, 10);

async function somar(env, chave, ttl){
  const atual = parseInt(await env.CONTAS.get(chave) || "0", 10) || 0;
  const novo = atual + 1;
  await env.CONTAS.put(chave, String(novo), {expirationTtl: ttl});
  return novo;
}

/* ── a API de try-on ─────────────────────────────────────────── */
async function criarJob(env, fotoPessoa, fotoPeca, categoria){
  const r = await fetch("https://api.fashn.ai/v1/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + env.FASHN_KEY
    },
    body: JSON.stringify({
      model_name: MODELO,
      inputs: {
        model_image: fotoPessoa,
        garment_image: fotoPeca,
        category: categoria || "auto"
      }
    })
  });
  const corpo = await r.json().catch(() => ({}));
  if(!r.ok) return {erro: corpo.error || corpo.message || ("a API respondeu " + r.status)};
  if(!corpo.id) return {erro: "a API não devolveu um identificador"};
  return {id: corpo.id};
}

async function verJob(env, id){
  const r = await fetch("https://api.fashn.ai/v1/status/" + encodeURIComponent(id), {
    headers: {"Authorization": "Bearer " + env.FASHN_KEY}
  });
  const corpo = await r.json().catch(() => ({}));
  if(!r.ok) return {erro: corpo.error || ("a API respondeu " + r.status)};
  return corpo;
}

/* ── entrada ─────────────────────────────────────────────────── */
export default {
  async fetch(pedido, env){
    const origem = pedido.headers.get("Origin");
    const cab = cors(env, origem);
    const url = new URL(pedido.url);

    if(pedido.method === "OPTIONS") return new Response(null, {status: 204, headers: cab});

    if(url.pathname === "/saude"){
      const usados = parseInt(await env.CONTAS.get("dia:" + hoje()) || "0", 10) || 0;
      return json({ok: true, hoje: usados, teto: +(env.TETO_DIA || 60)}, 200, cab);
    }

    /* Origin é verificado, mas não é a defesa principal: quem chama por
       fora do navegador não manda Origin nenhum. Serve para o site não ser
       usado como ponte por outra página. */
    const permitidas = (env.ORIGENS || "").split(",").map(s => s.trim()).filter(Boolean);
    if(origem && permitidas.length && !permitidas.includes(origem))
      return json({erro: "origem não autorizada"}, 403, cab);

    /* ── consultar um pedido em andamento ── */
    if(pedido.method === "GET" && url.pathname.startsWith("/provar/")){
      const id = url.pathname.slice("/provar/".length);
      /* letras, números, _ e - apenas: o que isto barra é travessia de
         caminho e injeção na URL, não o formato do id — que é da API, não
         meu para adivinhar. */
      if(!/^[A-Za-z0-9_-]{4,100}$/.test(id)) return json({erro: "identificador inválido"}, 400, cab);
      const r = await verJob(env, id);
      if(r.erro) return json({erro: r.erro}, 502, cab);
      return json({
        estado: r.status,
        /* devolve só o que o site precisa; nada de repassar o corpo inteiro */
        imagem: Array.isArray(r.output) && r.output.length ? r.output[0] : null,
        erro: r.status === "failed" ? (r.error && (r.error.message || r.error.name)) || "a geração falhou" : null
      }, 200, cab);
    }

    if(pedido.method !== "POST" || url.pathname !== "/provar")
      return json({erro: "caminho desconhecido"}, 404, cab);

    /* ── limites, antes de qualquer trabalho ── */
    const teto = +(env.TETO_DIA || 60);
    const usadosHoje = parseInt(await env.CONTAS.get("dia:" + hoje()) || "0", 10) || 0;
    if(usadosHoje >= teto)
      return json({erro: "teto do dia", mensagem:
        "O provador com IA já usou o limite de hoje. Ele volta amanhã."}, 429, cab);

    const ip = pedido.headers.get("CF-Connecting-IP") || "sem-ip";
    const porIp = parseInt(await env.CONTAS.get("ip:" + hoje() + ":" + ip) || "0", 10) || 0;
    const tetoIp = +(env.TETO_IP || 8);
    if(porIp >= tetoIp)
      return json({erro: "teto por pessoa", mensagem:
        "Você já provou " + tetoIp + " vezes hoje. Volte amanhã, ou fale com a loja no WhatsApp."}, 429, cab);

    /* ── entrada ── */
    /* O tamanho é conferido ANTES do parse: sem isto, um corpo de dezenas de
       megabytes seria lido e interpretado inteiro só para ser recusado
       depois — CPU do worker gasta de graça, a mando de quem ataca. */
    const tamanho = parseInt(pedido.headers.get("Content-Length") || "0", 10) || 0;
    if(tamanho > MAX_FOTO + 64*1024)
      return json({erro: "pedido muito grande"}, 413, cab);
    let corpo;
    try{ corpo = await pedido.json(); }
    catch(e){ return json({erro: "corpo inválido"}, 400, cab); }

    const foto = String(corpo.foto || "");
    const peca = String(corpo.peca || "");
    const categoria = ["tops","bottoms","one-pieces","auto"].includes(corpo.categoria)
      ? corpo.categoria : "auto";

    if(!/^data:image\/(jpeg|png|webp);base64,/.test(foto))
      return json({erro: "a foto precisa ser JPEG, PNG ou WEBP"}, 400, cab);
    if(foto.length > MAX_FOTO)
      return json({erro: "foto muito grande", mensagem: "Escolha uma foto menor."}, 413, cab);

    /* A peça só pode vir dos endereços que a loja autorizou. Sem isto, o
       endereço público viraria um gerador de try-on de graça para qualquer
       imagem da internet — na conta da loja. */
    const hostsPeca = (env.HOSTS_PECA || "").split(",").map(s => s.trim()).filter(Boolean);
    let hostOk = false;
    try{
      const u = new URL(peca);
      hostOk = u.protocol === "https:" && hostsPeca.some(h => u.hostname === h || u.hostname.endsWith("." + h));
    }catch(e){ hostOk = false; }
    if(!hostOk) return json({erro: "a peça não é de um endereço autorizado"}, 400, cab);

    /* ── conta ANTES de chamar: se a API demorar e a pessoa insistir, o
       contador já subiu e o teto continua valendo ── */
    await somar(env, "dia:" + hoje(), 60 * 60 * 30);
    await somar(env, "ip:" + hoje() + ":" + ip, 60 * 60 * 30);

    const r = await criarJob(env, foto, peca, categoria);
    if(r.erro) return json({erro: r.erro}, 502, cab);
    return json({id: r.id}, 202, cab);
  }
};
