/* S.I.G.O. V-BETA OFICIAL - NÚCLEO E CIVIL */
(function injetarDependencias() {
    if (!window.html2canvas) {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(s);
    }
    const st = document.createElement("style");
    st.innerHTML = `select,input[type="date"],input[type="number"],input[type="datetime-local"]{background-color:#080b12 !important;border:1px solid #1e293b !important;color:#f8fafc !important;padding:12px !important;border-radius:4px !important;font-family:'JetBrains Mono',monospace !important;font-size:11px !important;} .card-boletim{background:#080b12;border-left:4px solid var(--pm-blue);padding:15px;margin-bottom:10px;border-radius:4px;border:1px solid #1e293b;cursor:pointer;transition:0.2s;}.card-boletim:hover{background:#0f172a;transform:translateX(5px);}`;
    document.head.appendChild(st);
})();
const WEBHOOKS = {
    GERAL: "SEU_LINK_AQUI",
    APH: "SEU_LINK_AQUI",
    RUF: "SEU_LINK_AQUI",
    CORREGEDORIA: "SEU_LINK_AQUI",
    INVESTIGACAO: "SEU_LINK_AQUI",
    DETRAN: "SEU_LINK_AQUI",
    FINANCEIRO: "SEU_LINK_AQUI",
    WIPE: "SEU_LINK_AQUI",
};
const DEFAULT_CONFIG = {
    sigla: "S.I.G.O.",
    nome: "Secretaria de Segurança Pública",
    brasao: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Bras%C3%A3o_da_Pol%C3%ADcia_Militar_do_Estado_de_S%C3%A3o_Paulo.svg/200px-Bras%C3%A3o_da_Pol%C3%ADcia_Militar_do_Estado_de_S%C3%A3o_Paulo.svg.png",
};
const DEFAULT_MODULES = { detran: true, bo: true, ouvidoria: true, licencas: true, mandados: true };
let civilPassAtual = null,
    placaEmConsulta = null,
    etapaLogin = 0,
    usuarioTemporario = null,
    filtroAtual = "TODOS",
    filtroLogAtual = "TODOS";

window.$ = function (id) {
    return document.getElementById(id);
};
window.val = function (id) {
    return window.$(id) ? window.$(id).value.trim() : "";
};
window.setVal = function (id, v) {
    if (window.$(id)) window.$(id).value = v;
};
window.html = function (id, v) {
    if (window.$(id)) window.$(id).innerHTML = v;
};
window.txt = function (id, v) {
    if (window.$(id)) window.$(id).innerText = v;
};
window.shw = function (id) {
    if (window.$(id)) window.$(id).classList.remove("hidden");
};
window.hid = function (id) {
    if (window.$(id)) window.$(id).classList.add("hidden");
};
function gerarCodigoCidadao() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function gerarIPFake() {
    return (
        Math.floor(Math.random() * 255) +
        "." +
        Math.floor(Math.random() * 255) +
        "." +
        Math.floor(Math.random() * 255) +
        "." +
        Math.floor(Math.random() * 255)
    );
}

window.sigoNotify = function (ti, m, tp = "info") {
    let c = window.$("sigo-notif-container");
    if (!c) {
        c = document.createElement("div");
        c.id = "sigo-notif-container";
        document.body.appendChild(c);
    }
    const t = document.createElement("div");
    t.className = `sigo-toast ${tp}`;
    t.innerHTML = `<span class="toast-titulo">[ ${ti} ]</span><span class="font-mono">${m}</span>`;
    c.appendChild(t);
    setTimeout(() => {
        t.style.animation = "fadeOut 0.3s ease forwards";
        setTimeout(() => t.remove(), 300);
    }, 4500);
};
window.sigoConfirm = function (tx) {
    return new Promise((r) => {
        let c = window.$("sigo-popup-container");
        if (!c) {
            c = document.createElement("div");
            c.id = "sigo-popup-container";
            c.style =
                "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;display:flex;justify-content:center;align-items:center;";
            document.body.appendChild(c);
        }
        c.style.pointerEvents = "auto";
        c.style.background = "rgba(0,0,0,0.8)";
        c.innerHTML = `<div class="step-animado" style="background:#0f172a;border:2px solid var(--warning-yellow);padding:30px;border-radius:4px;text-align:center;max-width:400px;"><h3 style="color:var(--warning-yellow);font-family:'JetBrains Mono';font-size:16px;margin-bottom:15px;">[ VERIFICAÇÃO ]</h3><p style="color:#cbd5e1;font-size:12px;margin-bottom:25px;">${tx}</p><div style="display:flex;gap:15px;justify-content:center;"><button id="btn-conf-sim" class="btn-entrar font-mono" style="background:var(--success-green);color:#000;width:auto;padding:10px 20px;">[ SIM ]</button><button id="btn-conf-nao" class="btn-perigo font-mono" style="width:auto;padding:10px 20px;">[ NÃO ]</button></div></div>`;
        window.$("btn-conf-sim").onclick = () => {
            c.innerHTML = "";
            c.style.pointerEvents = "none";
            c.style.background = "transparent";
            r(true);
        };
        window.$("btn-conf-nao").onclick = () => {
            c.innerHTML = "";
            c.style.pointerEvents = "none";
            c.style.background = "transparent";
            r(false);
        };
    });
};
window.sigoPrompt = function (tx, ip = false) {
    return new Promise((r) => {
        let c = window.$("sigo-popup-container");
        if (!c) {
            c = document.createElement("div");
            c.id = "sigo-popup-container";
            c.style =
                "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;display:flex;justify-content:center;align-items:center;";
            document.body.appendChild(c);
        }
        c.style.pointerEvents = "auto";
        c.style.background = "rgba(0,0,0,0.8)";
        c.innerHTML = `<div class="step-animado" style="background:#0f172a;border:2px solid var(--pm-blue);padding:30px;border-radius:4px;text-align:center;max-width:400px;"><h3 style="color:var(--pm-blue);font-family:'JetBrains Mono';font-size:16px;margin-bottom:15px;">[ ENTRADA DE DADOS ]</h3><p style="color:#cbd5e1;font-size:12px;margin-bottom:15px;">${tx}</p><input type="${ip ? "password" : "text"}" id="prompt-input" class="input-busca font-mono" style="width:100%;margin-bottom:20px;text-align:center;" autofocus><div style="display:flex;gap:15px;justify-content:center;"><button id="btn-prm-sim" class="btn-entrar font-mono" style="background:var(--pm-blue);color:#000;width:auto;padding:10px 20px;">[ OK ]</button><button id="btn-prm-nao" class="btn-perigo font-mono" style="width:auto;padding:10px 20px;">[ CANCELAR ]</button></div></div>`;
        window.$("prompt-input").focus();
        window.$("btn-prm-sim").onclick = () => {
            const v = window.$("prompt-input").value;
            c.innerHTML = "";
            c.style.pointerEvents = "none";
            c.style.background = "transparent";
            r(v);
        };
        window.$("btn-prm-nao").onclick = () => {
            c.innerHTML = "";
            c.style.pointerEvents = "none";
            c.style.background = "transparent";
            r(null);
        };
    });
};

window.marcarOffline = function () {
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (u && u.tipo !== "CIVIL") {
        const db = JSON.parse(localStorage.getItem("sigo_db_usuarios"));
        if (db && db[u.passaporte]) {
            db[u.passaporte].online = false;
            db[u.passaporte].ultimaAcao = "OFFLINE";
            localStorage.setItem("sigo_db_usuarios", JSON.stringify(db));
        }
    }
};
window.deslogarSistema = function (f = false) {
    if (!f) window.marcarOffline();
    sessionStorage.removeItem("sigo_oficial_logado");
    window.location.href = "index.html";
};

window.carregarConfiguracoesGlobais = function () {
    const c = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
    if (window.$("favicon-global")) window.$("favicon-global").href = c.brasao;
    ["logo-splash", "logo-header-login", "logo-sidebar", "logo-sidebar-admin"].forEach((id) => {
        if (window.$(id)) window.$(id).src = c.brasao;
    });
    ["titulo-splash", "titulo-sigo-login", "titulo-sidebar", "titulo-sidebar-admin"].forEach((id) =>
        window.txt(id, c.sigla)
    );
    window.txt("nome-sec-login", c.nome);
};
window.aplicarTravaModulos = function () {
    const m = JSON.parse(localStorage.getItem("sigo_modulos")) || DEFAULT_MODULES;
    Object.keys(m).forEach((k) => {
        document.querySelectorAll(`.module-${k}`).forEach((e) => {
            e.style.display = m[k] ? "" : "none";
        });
    });
};
window.atualizarAcaoLogado = function (a) {
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (u && u.tipo !== "CIVIL") {
        const db = JSON.parse(localStorage.getItem("sigo_db_usuarios"));
        if (db && db[u.passaporte]) {
            db[u.passaporte].ultimaAcao = a.toUpperCase();
            localStorage.setItem("sigo_db_usuarios", JSON.stringify(db));
        }
    }
};

window.inicializarBanco = function () {
    if (!localStorage.getItem("sigo_v6_reset")) {
        const d = new Date().toLocaleString("pt-BR");
        const u = {
            3447: {
                passaporte: "3447",
                nome: "Comando Master",
                tipo: "ADMIN",
                patente: "Coronel",
                corp: "Gabinete",
                senha: "1012",
                posSenha: "123",
                status: "ATIVO",
                criacao: d,
                ip: "127.0.0.1",
                online: false,
                ultimaAcao: "Offline",
                ultimoAcesso: "Nunca",
                foto: DEFAULT_CONFIG.brasao,
            },
            "0000": {
                passaporte: "0000",
                nome: "Inspetor Deus",
                tipo: "DEV",
                patente: "DEV",
                corp: "Sistema",
                senha: "0000",
                posSenha: "000",
                status: "ATIVO",
                criacao: d,
                ip: "127.0.0.1",
                online: false,
                ultimaAcao: "Offline",
                ultimoAcesso: "Nunca",
                foto: DEFAULT_CONFIG.brasao,
            },
        };
        [
            "sigo_db_civis",
            "sigo_solicitacoes",
            "sigo_investigacoes",
            "sigo_db_veiculos",
            "sigo_db_multas",
            "sigo_db_logs",
            "sigo_db_licencas",
            "sigo_db_mandados",
            "sigo_bos_civis",
        ].forEach((k) => {
            if (!localStorage.getItem(k))
                localStorage.setItem(k, k === "sigo_db_civis" || k === "sigo_db_veiculos" ? "{}" : "[]");
        });
        if (!localStorage.getItem("sigo_db_usuarios")) localStorage.setItem("sigo_db_usuarios", JSON.stringify(u));
        if (!localStorage.getItem("sigo_db_batalhoes"))
            localStorage.setItem(
                "sigo_db_batalhoes",
                JSON.stringify(["Comando Geral", "1º GB", "22º BPM/M", "DEIC", "Base PF", "Base PRF"])
            );
        if (!localStorage.getItem("sigo_global_ui"))
            localStorage.setItem("sigo_global_ui", JSON.stringify(DEFAULT_CONFIG));
        if (!localStorage.getItem("sigo_modulos"))
            localStorage.setItem("sigo_modulos", JSON.stringify(DEFAULT_MODULES));
        localStorage.setItem("sigo_manutencao", "false");
        localStorage.setItem("sigo_v6_reset", "true");
    }
    window.carregarConfiguracoesGlobais();
    window.aplicarTravaModulos();
};
window.inicializarBanco();
window.addEventListener("storage", (e) => {
    if (e.key === "sigo_manutencao") window.verificarBloqueios();
    if (e.key === "sigo_global_ui") window.carregarConfiguracoesGlobais();
    if (e.key === "sigo_modulos") window.aplicarTravaModulos();
});
window.addEventListener("beforeunload", window.marcarOffline);
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.$("splash-screen")) {
            window.$("splash-screen").style.opacity = "0";
            setTimeout(() => window.hid("splash-screen"), 1000);
        }
    }, 2500);
});

window.verificarBloqueios = function () {
    const m = localStorage.getItem("sigo_manutencao") === "true";
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (u) {
        const db =
            u.tipo === "CIVIL"
                ? JSON.parse(localStorage.getItem("sigo_db_civis"))
                : JSON.parse(localStorage.getItem("sigo_db_usuarios"));
        if (!db || !db[u.passaporte]) return window.deslogarSistema(true);
        if (db[u.passaporte].status === "SUSPENSO") {
            window.shw("tela-suspensa");
            return;
        }
    }
    if (m && (!u || (u.tipo !== "ADMIN" && u.tipo !== "DEV"))) {
        window.shw("tela-manutencao");
        window.hid("main-container");
        if (document.querySelector(".dashboard-layout"))
            document.querySelector(".dashboard-layout").classList.add("hidden");
    } else {
        window.hid("tela-manutencao");
        window.hid("tela-suspensa");
        window.shw("main-container");
        if (document.querySelector(".dashboard-layout"))
            document.querySelector(".dashboard-layout").classList.remove("hidden");
    }
};
window.verificarBloqueios();

window.registrarLogInterno = function (cat, an, ap, d, m) {
    const l = JSON.parse(localStorage.getItem("sigo_db_logs")) || [];
    l.push({
        id: "LOG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        data: new Date().toLocaleString("pt-BR"),
        categoria: cat,
        modulo: m,
        autor: an,
        passaporte: ap,
        detalhes: d,
    });
    localStorage.setItem("sigo_db_logs", JSON.stringify(l));
};
window.enviarWebhook = function (u, t, d, c, th = null, f = [], ac = null, an = null) {
    if (!u || u.includes("SEU_LINK")) return;
    const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
    const op = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    let opTxt = "";
    if (op && op.tipo !== "CIVIL") {
        opTxt = `\n\n**[ OPERADOR RESPONSÁVEL ]**\n👮 ${op.patente} ${op.nome} (ID: ${op.passaporte})`;
    }
    const p = {
        username: `${cf.sigla} | Governamental`,
        avatar_url: cf.brasao,
        embeds: [
            {
                title: t,
                description: d + opTxt,
                color: parseInt(c.replace("#", ""), 16),
                fields: f,
                thumbnail: th ? { url: th } : null,
                footer: { text: cf.nome, icon_url: cf.brasao },
                timestamp: new Date().toISOString(),
            },
        ],
    };
    let o = { method: "POST" };
    if (ac && an) {
        const fd = new FormData();
        fd.append("payload_json", JSON.stringify(p));
        fd.append("file", new Blob([ac], { type: "text/plain" }), an);
        o.body = fd;
    } else {
        o.headers = { "Content-Type": "application/json" };
        o.body = JSON.stringify(p);
    }
    fetch(u, o).catch((e) => console.error("[S.I.G.O.]", e));
};
window.enviarWebhookAuditoriaIA = function (nM, p, log) {
    const u = WEBHOOKS.CORREGEDORIA;
    if (!u || u.includes("SEU_LINK")) return;
    const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
    const py = {
        username: "S.I.G.O. | Auditoria I.A.",
        avatar_url: cf.brasao,
        embeds: [
            {
                title: "🧠 [ REGISTRO DA I.A. ]",
                description: "Log bruto do laudo gerado.",
                color: 15844367,
                fields: [
                    { name: "👮 Operador", value: `${nM} (ID: ${p})`, inline: true },
                    { name: "📝 Log Bruto", value: log, inline: false },
                ],
                footer: { text: "Auditoria Interna" },
                timestamp: new Date().toISOString(),
            },
        ],
    };
    fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(py) }).catch((e) =>
        console.error(e)
    );
};
window.enviarImagemDiscord = function (d, n, w, t) {
    const tg = window.$(d);
    if (!tg) return;
    const u = WEBHOOKS[w];
    if (!u || u.includes("SEU_LINK")) return window.sigoNotify("ERRO", "Webhook não configurada.", "erro");
    const b = event.target;
    const tb = b.innerText;
    b.innerText = "[ ENVIANDO... ]";
    b.style.pointerEvents = "none";
    b.style.opacity = "0.7";
    html2canvas(tg, { backgroundColor: "#ffffff", scale: 2 }).then((c) => {
        c.toBlob((bl) => {
            const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
            const op = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
            let opTxt = op ? `\n**Redigido por:** ${op.patente} ${op.nome} (${op.passaporte})` : "";
            const fd = new FormData();
            const p = {
                username: `${cf.sigla} | Autos Oficiais`,
                avatar_url: cf.brasao,
                embeds: [
                    {
                        title: `📄 ${t}`,
                        description: "Documento oficial validado e indexado ao banco de dados estadual." + opTxt,
                        color: 3447003,
                        image: { url: `attachment://${n}` },
                        footer: { text: "Secretaria de Segurança Pública" },
                        timestamp: new Date().toISOString(),
                    },
                ],
            };
            fd.append("payload_json", JSON.stringify(p));
            fd.append("file", bl, n);
            fetch(u, { method: "POST", body: fd })
                .then((r) => {
                    if (r.ok) window.sigoNotify("TRANSMITIDO", "Documento enviado!", "sucesso");
                    else throw new Error();
                })
                .catch(() => window.sigoNotify("ERRO", "Falha no Discord.", "erro"))
                .finally(() => {
                    b.innerText = tb;
                    b.style.pointerEvents = "auto";
                    b.style.opacity = "1";
                });
        }, "image/png");
    });
};

window.voltarInicio = function () {
    [
        "step-identificacao",
        "step-pin-militar",
        "step-pin-civil",
        "step-cadastro-civil",
        "step-login-civil",
        "step-login-militar",
    ].forEach(window.hid);
    if (window.$("main-container")) window.$("main-container").classList.remove("form-expandido");
    window.shw("header-identificacao");
    usuarioTemporario = null;
    civilPassAtual = null;
    etapaLogin = 0;
    window.shw("step-identificacao");
    window.setVal("input-cpf", "");
    if (window.$("input-cpf")) window.$("input-cpf").focus();
};
window.iniciarBusca = function () {
    const p = window.val("input-cpf");
    if (!p || p.length > 4) return window.sigoNotify("ERRO", "ID inválido.", "erro");
    if (localStorage.getItem("sigo_manutencao") === "true" && p !== "3447" && p !== "0000")
        return window.sigoNotify("NEGADO", "Manutenção.", "erro");
    window.shw("loading-overlay");
    setTimeout(() => {
        window.hid("loading-overlay");
        window.processarRoteamento(p);
    }, 800);
};
window.processarRoteamento = function (p) {
    const dm = JSON.parse(localStorage.getItem("sigo_db_usuarios")) || {},
        dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    [
        "step-identificacao",
        "step-pin-militar",
        "step-pin-civil",
        "step-cadastro-civil",
        "step-login-civil",
        "step-login-militar",
    ].forEach(window.hid);
    if (dm[p]) {
        if (dm[p].status === "SUSPENSO") {
            window.sigoNotify("REVOGADO", "Credencial suspensa.", "erro");
            window.shw("step-identificacao");
            return;
        }
        usuarioTemporario = dm[p];
        window.setVal("input-pin", "");
        window.shw("step-pin-militar");
        if (window.$("input-pin")) window.$("input-pin").focus();
    } else if (dc[p]) {
        if (dc[p].status === "SUSPENSO") {
            window.sigoNotify("REVOGADO", "Conta bloqueada.", "erro");
            window.shw("step-identificacao");
            return;
        }
        civilPassAtual = p;
        window.setVal("input-pin-civil", "");
        window.shw("step-pin-civil");
        if (window.$("input-pin-civil")) window.$("input-pin-civil").focus();
    } else {
        window.sigoNotify("AVISO", "Iniciando registro.", "aviso");
        window.setVal("cad-civil-pass", p);
        if (window.$("main-container")) window.$("main-container").classList.add("form-expandido");
        window.shw("step-cadastro-civil");
        if (window.$("cad-civil-nome")) window.$("cad-civil-nome").focus();
    }
};
window.validarPin = function () {
    const s = window.val("input-pin");
    if (s === usuarioTemporario.senha) {
        usuarioTemporario.online = true;
        usuarioTemporario.ultimoAcesso = new Date().toLocaleString("pt-BR");
        usuarioTemporario.ultimaAcao = "LOGANDO";
        if (!usuarioTemporario.ip) usuarioTemporario.ip = gerarIPFake();
        const db = JSON.parse(localStorage.getItem("sigo_db_usuarios"));
        db[usuarioTemporario.passaporte] = usuarioTemporario;
        localStorage.setItem("sigo_db_usuarios", JSON.stringify(db));
        [
            "step-identificacao",
            "step-pin-militar",
            "step-pin-civil",
            "step-cadastro-civil",
            "step-login-civil",
            "step-login-militar",
        ].forEach(window.hid);
        window.shw("step-login-militar");
        window.txt("nome-militar", usuarioTemporario.patente + " " + usuarioTemporario.nome);
        window.txt("corp-militar", usuarioTemporario.corp);
        window.txt("pass-militar", usuarioTemporario.passaporte);
        if (window.$("foto-militar")) window.$("foto-militar").src = usuarioTemporario.foto || DEFAULT_CONFIG.brasao;
        window.sigoNotify("LIBERADO", "Autenticado.", "sucesso");
        window.registrarLogInterno(
            "POLICIA",
            usuarioTemporario.nome,
            usuarioTemporario.passaporte,
            `Sessão iniciada.`,
            "LOGIN"
        );
    } else {
        window.sigoNotify("FALHA", "Senha incorreta.", "erro");
        window.setVal("input-pin", "");
    }
};
window.validarPinCivil = function () {
    const db = JSON.parse(localStorage.getItem("sigo_db_civis")) || {},
        c = db[civilPassAtual],
        s = window.val("input-pin-civil");
    if (!c.senha) {
        if (s.length < 4) return window.sigoNotify("AVISO", "Mínimo 4 dígitos.", "aviso");
        c.senha = s;
        localStorage.setItem("sigo_db_civis", JSON.stringify(db));
        window.sigoNotify("SALVA", "Senha Gov registrada.", "sucesso");
        window.autenticarCivilPre(c);
    } else if (s === c.senha) {
        window.sigoNotify("LIBERADO", "Acesso Gov.br.", "sucesso");
        window.autenticarCivilPre(c);
    } else {
        window.sigoNotify("FALHA", "Senha incorreta.", "erro");
        window.setVal("input-pin-civil", "");
    }
};
window.autenticarMilitar = function () {
    sessionStorage.setItem("sigo_oficial_logado", JSON.stringify(usuarioTemporario));
    window.location.href =
        usuarioTemporario.tipo === "ADMIN" || usuarioTemporario.tipo === "DEV" ? "admin.html" : "painel.html";
};
window.salvarCadastroCivil = function () {
    const p = window.val("cad-civil-pass"),
        s = window.val("cad-civil-senha"),
        d = window.val("cad-civil-discord"),
        t = window.val("cad-civil-tel");
    if (!d || t.length < 14 || !s || s.length < 4)
        return window.sigoNotify("ERRO", "Preencha Tel, Discord e Senha.", "erro");
    const n = {
        passaporte: p,
        senha: s,
        codigoUnico: gerarCodigoCidadao(),
        nome: window.val("cad-civil-nome"),
        idade: window.val("cad-civil-idade"),
        sangue: window.val("cad-civil-sangue"),
        estadoCivil: window.val("cad-civil-estado"),
        telefone: t,
        endereco: window.val("cad-civil-endereco"),
        emprego: window.val("cad-civil-emprego"),
        estudo: window.val("cad-civil-estudo"),
        email: window.val("cad-civil-email"),
        discord: d,
        foto: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
        status: "ATIVO",
        criacao: new Date().toLocaleString("pt-BR"),
        ip: gerarIPFake(),
        tipo: "CIVIL",
    };
    if (!n.nome || !n.idade) return window.sigoNotify("ERRO", "Faltam campos.", "erro");
    const db = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    db[p] = n;
    localStorage.setItem("sigo_db_civis", JSON.stringify(db));
    window.sigoNotify("CONCLUÍDO", "Base atualizada.", "sucesso");
    window.registrarLogInterno("CIVIL", n.nome, n.passaporte, `Novo civil.`, "LOGIN");
    window.enviarWebhook(WEBHOOKS.GERAL, "👤 NOVO REGISTRO", `**Nome:** ${n.nome}\n**ID:** ${n.passaporte}`, "#059669");
    window.autenticarCivilPre(n);
};
window.autenticarCivilPre = function (c) {
    [
        "step-identificacao",
        "step-pin-militar",
        "step-pin-civil",
        "step-cadastro-civil",
        "step-login-civil",
        "step-login-militar",
    ].forEach(window.hid);
    civilPassAtual = c.passaporte;
    window.hid("header-identificacao");
    if (window.$("main-container")) window.$("main-container").classList.add("form-expandido");
    window.txt("nome-civil-cadastrado", c.nome);
    if (window.$("foto-civil-perfil"))
        window.$("foto-civil-perfil").src = c.foto || "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";
    const db = JSON.parse(localStorage.getItem("sigo_db_civis"));
    if (!db[c.passaporte].codigoUnico) {
        db[c.passaporte].codigoUnico = gerarCodigoCidadao();
        localStorage.setItem("sigo_db_civis", JSON.stringify(db));
        c.codigoUnico = db[c.passaporte].codigoUnico;
    }
    window.txt("cod-civil-cadastrado", "CÓD: " + c.codigoUnico.toUpperCase());
    window.shw("step-login-civil");
    db[c.passaporte].ultimoAcesso = new Date().toLocaleString("pt-BR");
    localStorage.setItem("sigo_db_civis", JSON.stringify(db));
    window.mudarAbaCivil("aba-civil-perfil");
    window.renderizarPainelCivilDash(c.passaporte);
    window.gerarNadaConsta(c.passaporte);
    window.carregarOficiaisParaDenuncia();
    window.renderizarDetranCivil(c.passaporte);
    window.renderizarMeusBOCivis();
    window.registrarLogInterno("CIVIL", c.nome, c.passaporte, "Logou Gov.br", "LOGIN");
};

window.mudarAbaCivil = function (id) {
    [
        "aba-civil-perfil",
        "aba-civil-nada-consta",
        "aba-civil-detran",
        "aba-civil-delegacia",
        "aba-civil-ouvidoria",
    ].forEach(window.hid);
    [
        "btn-civil-perfil",
        "btn-civil-nada-consta",
        "btn-civil-detran",
        "btn-civil-delegacia",
        "btn-civil-ouvidoria",
    ].forEach((i) => {
        if (window.$(i)) window.$(i).classList.remove("ativo");
    });
    window.shw(id);
    const b = id.replace("aba-", "btn-");
    if (window.$(b)) window.$(b).classList.add("ativo");
};
window.enviarBOCivil = async function () {
    const t = window.val("bo-civil-tipo"),
        d = window.val("bo-civil-data"),
        r = window.val("bo-civil-relato");
    if (!d || !r) return window.sigoNotify("ERRO", "Preencha tudo.", "erro");
    const c = JSON.parse(localStorage.getItem("sigo_db_civis"))[civilPassAtual];
    const p = await window.sigoPrompt("Senha Gov.br para assinar:", true);
    if (p !== c.senha) return window.sigoNotify("RECUSADO", "Senha incorreta.", "erro");
    const bos = JSON.parse(localStorage.getItem("sigo_bos_civis")) || [];
    const pt = "BOC-" + Math.floor(100000 + Math.random() * 900000);
    bos.push({
        id: pt,
        civilPass: civilPassAtual,
        nomeCivil: c.nome,
        tipo: t,
        dataOcorrencia: d.replace("T", " às "),
        relato: r,
        status: "EM ANÁLISE",
        dataRegistro: new Date().toLocaleString("pt-BR"),
    });
    localStorage.setItem("sigo_bos_civis", JSON.stringify(bos));
    window.registrarLogInterno("CIVIL", c.nome, civilPassAtual, `BO Eletrônico ${pt}`, "DELEGACIA");
    window.enviarWebhook(WEBHOOKS.GERAL, `💻 B.O (CIVIL) [${pt}]`, `**Cidadão:** ${c.nome}\n**Fato:** ${r}`, "#0ea5e9");
    window.sigoNotify("SUCESSO", "Enviado à Civil.", "sucesso");
    window.setVal("bo-civil-data", "");
    window.setVal("bo-civil-relato", "");
    window.renderizarMeusBOCivis();
};
window.renderizarMeusBOCivis = function () {
    if (!window.$("lista-bos-civis-status")) return;
    const bos = JSON.parse(localStorage.getItem("sigo_bos_civis")) || [],
        mb = bos.filter((b) => b.civilPass === civilPassAtual);
    if (mb.length === 0)
        return window.html(
            "lista-bos-civis-status",
            `<p class="font-mono" style="font-size:10px;color:#64748b;">Sem ocorrências.</p>`
        );
    let h = "";
    mb.reverse().forEach((b) => {
        let cs =
            b.status === "VALIDADO"
                ? "var(--success-green)"
                : b.status === "REJEITADO"
                  ? "var(--bombeiro-red)"
                  : "var(--warning-yellow)";
        h += `<div style="background:#080b12;border-left:3px solid ${cs};padding:15px;margin-bottom:10px;border-radius:3px;"><div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span style="color:#f8fafc;font-size:12px;font-weight:800;">${b.tipo}</span><span style="font-size:10px;color:${cs};font-weight:800;">[ ${b.status} ]</span></div><p style="font-size:10px;color:#cbd5e1;">Prot: ${b.id} | Data: ${b.dataOcorrencia}</p></div>`;
    });
    window.html("lista-bos-civis-status", h);
};
window.renderizarPainelCivilDash = function (p) {
    if (!window.$("civil-historico-container")) return;
    let h = "";
    const l = JSON.parse(localStorage.getItem("sigo_db_licencas")) || [],
        ml = l.filter((x) => x.passaporte === p);
    if (ml.length > 0) {
        h += `<h4 style="color:var(--gov-light);font-size:10px;border-bottom:1px solid #1e293b;padding-bottom:5px;margin-top:20px;margin-bottom:15px;">DOCUMENTOS</h4><div style="display:flex;gap:15px;flex-wrap:wrap;margin-bottom:30px;">`;
        ml.forEach((x) => {
            h += `<div style="background:#082f49;border:1px solid var(--gov-light);padding:20px;border-radius:4px;flex:1;min-width:250px;"><h5 style="color:var(--gov-light);font-size:14px;">${x.tipo}</h5><p style="font-size:10px;color:#bae6fd;">Prot: ${x.id}</p><button class="btn-entrar font-mono mt-15" style="background:var(--gov-blue);color:#fff;border:none;padding:10px;" onclick="abrirCRAFCivil('${x.id}')">[ VISUALIZAR ]</button></div>`;
        });
        h += `</div>`;
    }
    window.html("civil-historico-container", h);
};
window.abrirCRAFCivil = async function (id) {
    const pin = await window.sigoPrompt("Senha numérica:", true);
    if (!pin) return;
    const c = JSON.parse(localStorage.getItem("sigo_db_civis"))[civilPassAtual];
    if (pin !== c.senha) return window.sigoNotify("NEGADO", "Senha incorreta.", "erro");
    const l = (JSON.parse(localStorage.getItem("sigo_db_licencas")) || []).find((x) => x.id === id);
    if (l) {
        const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
        let a = l.arma
            ? `<div style="background:#e2e8f0;padding:10px;border-left:4px solid #0369a1;margin:20px 0;"><p style="font-size:11px;color:#334155;"><strong>ARMA:</strong> ${l.arma.toUpperCase()}</p></div>`
            : "";
        window.html(
            "conteudo-documento-licenca",
            `<div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:20px;margin-bottom:20px;"><img src="${cf.brasao}" style="width:60px;filter:grayscale(100%);margin-bottom:10px;"><h2 style="font-size:18px;font-weight:900;color:#0f172a;">R.F.B.</h2><h3 style="font-size:14px;font-weight:800;color:#0369a1;">${l.tipo.toUpperCase()}</h3><p style="font-size:10px;color:#475569;">CERTIFICADO N° ${l.id}</p></div><div style="display:flex;justify-content:space-between;margin-bottom:15px;"><div><p style="font-size:10px;color:#64748b;">TITULAR</p><p style="font-size:14px;font-weight:800;">${c.nome.toUpperCase()}</p></div><div style="text-align:right;"><p style="font-size:10px;color:#64748b;">ID</p><p style="font-size:14px;font-weight:800;">${c.passaporte}</p></div></div>${a}<div style="margin-bottom:20px;"><p style="font-size:10px;color:#64748b;">LAUDO:</p><div style="background:#fff;border:1px solid #cbd5e1;padding:15px;font-size:11px;color:#0f172a;">"${l.obs}"</div></div><div style="text-align:center;color:#15803d;font-weight:800;border:2px dashed #15803d;padding:10px;margin-top:30px;">VALIDADO</div>`
        );
        window.shw("modal-documento-licenca");
    }
};
window.gerarNadaConsta = function (p) {
    if (!window.$("container-documento-nada-consta")) return;
    const ia = (JSON.parse(localStorage.getItem("sigo_investigacoes")) || []).filter(
        (x) => x.alvoPass === p && x.status === "ABERTO"
    );
    const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
    if (ia.length === 0) {
        window.html(
            "container-documento-nada-consta",
            `<div class="doc-nada-consta"><div class="doc-header-civil"><img src="${cf.brasao}" style="width:50px;margin-bottom:10px;"><h3>${cf.nome}</h3><p>NADA CONSTA</p></div><div class="doc-body-civil"><p>NÃO CONSTA anotações criminais para o ID <strong>${p}</strong>.</p><div class="carimbo-verde">AUTENTICADO</div></div></div>`
        );
    } else {
        window.html(
            "container-documento-nada-consta",
            `<div class="doc-nada-consta" style="border-color:var(--bombeiro-red);background:rgba(220,38,38,0.02);"><div class="doc-header-civil" style="border-bottom-color:var(--bombeiro-red);"><img src="${cf.brasao}" style="width:50px;filter:grayscale(100%);margin-bottom:10px;"><h3 style="color:var(--bombeiro-red);">${cf.nome}</h3><p style="color:var(--bombeiro-red);">POSSUI ANTECEDENTES</p></div><div class="doc-body-civil"><p>CONSTA inquérito ativo para o ID <strong>${p}</strong>.</p><div class="carimbo-verde" style="color:var(--bombeiro-red);border-color:var(--bombeiro-red);">REGISTRO POSITIVO</div></div></div>`
        );
    }
};
window.transferirVeiculoCivil = async function (pl) {
    const ci = await window.sigoPrompt(`ID do comprador para a placa ${pl}:`);
    if (!ci || ci === civilPassAtual) return;
    const dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    if (!dc[ci]) return window.sigoNotify("ERRO", "Comprador não encontrado.", "erro");
    const c = dc[civilPassAtual],
        pin = await window.sigoPrompt(`Senha para transferir para ${dc[ci].nome}:`, true);
    if (pin !== c.senha) return window.sigoNotify("RECUSADO", "Senha incorreta.", "erro");
    const dv = JSON.parse(localStorage.getItem("sigo_db_veiculos")) || {};
    dv[pl].proprietario = ci;
    localStorage.setItem("sigo_db_veiculos", JSON.stringify(dv));
    window.registrarLogInterno("CIVIL", c.nome, civilPassAtual, `Transferiu ${pl} para ${ci}`, "DETRAN");
    window.enviarWebhook(
        WEBHOOKS.DETRAN,
        "🔄 TRANSFERÊNCIA",
        `**Vendedor:** ${c.nome}\n**Comprador ID:** ${ci}\n**Placa:** ${pl}`,
        "#0ea5e9"
    );
    window.sigoNotify("SUCESSO", "Transferido.", "sucesso");
    window.renderizarDetranCivil(civilPassAtual);
};
window.renderizarDetranCivil = function (p) {
    if (!window.$("container-cnh-digital")) return;
    const c = JSON.parse(localStorage.getItem("sigo_db_civis"))[p],
        m = JSON.parse(localStorage.getItem("sigo_db_multas")) || [],
        v = Object.values(JSON.parse(localStorage.getItem("sigo_db_veiculos")) || {}).filter(
            (x) => x.proprietario === p
        ),
        pt = m.filter((x) => x.passaporte === p).length * 5,
        sp = pt >= 20;
    window.html(
        "container-cnh-digital",
        `<div class="cnh-documento ${sp ? "cnh-suspensa" : ""}"><div class="cnh-pontos">${pt} PTS</div><div class="cnh-dados"><h4>C.N.H.</h4><p style="font-size:10px;color:#86efac;margin-bottom:0;">CONDUTOR</p><p>${c.nome}</p><p style="color:${sp ? "#fca5a5" : "#fff"};">${sp ? "SUSPENSA" : "REGULAR"}</p></div></div>`
    );
    if (window.$("lista-meus-veiculos")) {
        let hv = "";
        if (v.length === 0) hv = `<p class="font-mono" style="font-size:10px;color:#64748b;">Sem veículos.</p>`;
        else
            v.forEach((x) => {
                const st = x.status === "APREENDIDO" ? "bad" : "ok";
                hv += `<div class="card-veiculo ${x.status === "APREENDIDO" ? "status-apreendido" : ""}"><div class="veiculo-info"><h4>${x.modelo} - ${x.cor}</h4><p>PLACA: ${x.placa}</p><span class="status-badge ${st}">${x.status}</span><br><button class="btn-neutro font-mono mt-15" style="padding:5px;font-size:8px;border-color:#0ea5e9;color:#0ea5e9;" onclick="transferirVeiculoCivil('${x.placa}')">[ TRANSFERIR ]</button></div></div>`;
            });
        window.html("lista-meus-veiculos", hv);
    }
    if (window.$("lista-minhas-multas")) {
        let hm = "";
        const mm = m.filter((x) => x.passaporte === p);
        if (mm.length === 0) hm = `<p class="font-mono" style="font-size:10px;color:#64748b;">Sem infrações.</p>`;
        else
            mm.forEach((x) => {
                let a =
                    x.status === "AGUARDANDO_BAIXA"
                        ? `<span style="color:var(--warning-yellow);font-size:9px;">AGUARDANDO...</span>`
                        : `<button class="btn-neutro font-mono" style="padding:5px;font-size:8px;color:var(--success-green);border-color:var(--success-green);" onclick="solicitarPagamentoMulta('${x.id}')">[ SOLICITAR BAIXA ]</button>`;
                hm += `<div class="card-multa" style="${x.status === "AGUARDANDO_BAIXA" ? "border-color:#64748b;opacity:0.7;" : ""}"><div class="multa-info"><h5 style="${x.status === "AGUARDANDO_BAIXA" ? "color:#94a3b8" : ""}">${x.motivo}</h5><p>${x.placa} | ${x.id}</p></div><div style="text-align:right;"><p class="multa-valor">R$ ${x.valor},00</p>${a}</div></div>`;
            });
        window.html("lista-minhas-multas", hm);
    }
};
window.solicitarPagamentoMulta = async function (id) {
    const cf = await window.sigoConfirm("A baixa precisa de validação. Confirmar?");
    if (!cf) return;
    let dm = JSON.parse(localStorage.getItem("sigo_db_multas")) || [],
        m = dm.find((x) => x.id === id);
    if (m) {
        m.status = "AGUARDANDO_BAIXA";
        localStorage.setItem("sigo_db_multas", JSON.stringify(dm));
        window.sigoNotify("ENVIADA", "Aguarde o Detran.", "sucesso");
        window.renderizarDetranCivil(civilPassAtual);
    }
};
window.carregarOficiaisParaDenuncia = function () {
    if (!window.$("denuncia-oficial-alvo")) return;
    let ho = '<option value="">Selecione oficial...</option>';
    Object.values(JSON.parse(localStorage.getItem("sigo_db_usuarios")) || {}).forEach((u) => {
        if (u.tipo !== "ADMIN" && u.tipo !== "DEV")
            ho += `<option value="${u.passaporte}">${u.patente} ${u.nome}</option>`;
    });
    window.html("denuncia-oficial-alvo", ho);
};
window.enviarDenunciaCorregedoria = function () {
    const a = window.val("denuncia-oficial-alvo"),
        r = window.val("denuncia-relato");
    if (!a || !r) return window.sigoNotify("ERRO", "Preencha tudo.", "erro");
    const du = JSON.parse(localStorage.getItem("sigo_db_usuarios")) || {},
        sl = JSON.parse(localStorage.getItem("sigo_solicitacoes")) || [];
    sl.push({
        id: "DEN-" + Math.floor(1000 + Math.random() * 9000),
        protocolo: "ID: " + civilPassAtual,
        tipo: "DENÚNCIA",
        oficial: `${du[a].patente} ${du[a].nome}`,
        oficialPass: du[a].passaporte,
        motivo: `[OUVIDORIA] ${r}`,
        data: new Date().toLocaleString("pt-BR"),
        status: "PENDENTE",
    });
    localStorage.setItem("sigo_solicitacoes", JSON.stringify(sl));
    window.enviarWebhook(WEBHOOKS.CORREGEDORIA, "🚨 DENÚNCIA", `**Alvo:** ${du[a].nome}\n**Relato:** ${r}`, "#e11d48");
    window.sigoNotify("SUCESSO", "Enviada.", "sucesso");
    window.setVal("denuncia-relato", "");
    window.setVal("denuncia-oficial-alvo", "");
    window.mudarAbaCivil("aba-civil-perfil");
};
/* S.I.G.O. V-BETA OFICIAL - PAINEL, ADMIN E WATCHDOG */
window.carregarDadosPainel = function () {
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (!u || u.tipo === "CIVIL") return (window.location.href = "index.html");
    if (window.$("topbar-nome")) window.txt("topbar-nome", u.patente + " " + u.nome);
    window.setVal("aph-socorrista-nome", u.patente + " " + u.nome);
    window.setVal("aph-socorrista-pass", u.passaporte);
    const b = window.$("topbar-badge");
    if (b) {
        if (u.tipo === "DEV") {
            b.innerText = "INSPETOR DEV";
            b.className = "badge";
            b.style.backgroundColor = "#c084fc";
            b.style.color = "#000";
            window.txt("titulo-sigo-pequeno", "S.I.G.O. INTELIGENTE");
        } else if (u.tipo === "PM" || u.tipo === "PC") {
            b.innerText = u.tipo === "PM" ? "PMESP" : "PCSP";
            b.className = "badge badge-pm";
            window.txt("titulo-sigo-pequeno", "S.I.G.O. TÁTICO");
        } else if (u.tipo === "PF") {
            b.innerText = "POLÍCIA FEDERAL";
            b.className = "badge badge-pf";
            window.txt("titulo-sigo-pequeno", "FEDERAL");
        } else if (u.tipo === "PRF") {
            b.innerText = "POLÍCIA RODOVIÁRIA";
            b.className = "badge badge-prf";
        } else {
            b.innerText = "BOMBEIRO MILITAR";
            b.className = "badge badge-bombeiro";
        }
    }
    window.atualizarAcaoLogado("EM PAINEL");
    window.carregarMeusBoletinsPainel();
};
window.acionarQRR = async function () {
    const c = await window.sigoConfirm("Disparar QRR LETAIS?");
    if (!c) return;
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.5);
    o.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 1);
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    window.registrarLogInterno("POLICIA", u.nome, u.passaporte, `QRR ACIONADO`, "SISTEMA");
    window.enviarWebhook(WEBHOOKS.GERAL, `🚨 [ QRR ] 🚨`, `**AGENTE:** ${u.patente} ${u.nome}`, "#dc2626");
    window.sigoNotify("QRR", "Sinal emitido.", "aviso");
};
window.mudarAba = function (id) {
    [
        "aba-novo-aph",
        "aba-historico",
        "aba-uso-forca",
        "aba-mandados",
        "aba-detran",
        "aba-delegacia-policia",
        "aba-licencas",
    ].forEach(window.hid);
    [
        "btn-aba-novo-aph",
        "btn-aba-historico",
        "btn-aba-uso-forca",
        "btn-aba-mandados",
        "btn-aba-detran",
        "btn-aba-delegacia-policia",
        "btn-aba-licencas",
    ].forEach((i) => {
        if (window.$(i)) window.$(i).classList.remove("ativo");
    });
    window.shw(id);
    if (window.$("btn-" + id)) window.$("btn-" + id).classList.add("ativo");
    window.atualizarAcaoLogado("EM PAINEL");
    if (id === "aba-licencas") {
        const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
        if (u && u.tipo !== "PF" && u.tipo !== "ADMIN" && u.tipo !== "DEV") {
            if (window.$("painel-emitir-licenca")) window.$("painel-emitir-licenca").style.display = "none";
            if (window.$("painel-buscar-licenca")) window.$("painel-buscar-licenca").classList.add("form-grid-full");
        } else {
            if (window.$("painel-emitir-licenca")) window.$("painel-emitir-licenca").style.display = "block";
            if (window.$("painel-buscar-licenca")) window.$("painel-buscar-licenca").classList.remove("form-grid-full");
        }
        window.renderizarLicencasPainel();
    }
    if (id === "aba-mandados") window.renderizarProcurados();
    if (id === "aba-delegacia-policia") window.renderizarBOCivisParaAnalise();
    if (id === "aba-historico") window.carregarMeusBoletinsPainel();
};
window.trocarStatus = function () {
    const b = window.$("btn-status-servico");
    if (b) {
        if (b.classList.contains("qap")) {
            b.classList.remove("qap");
            b.classList.add("qrv");
            b.innerText = "[ QRV ] FORA DE SERVIÇO";
            window.atualizarAcaoLogado("FORA DE SERVIÇO");
        } else {
            b.classList.remove("qrv");
            b.classList.add("qap");
            b.innerText = "[ QAP ] EM SERVIÇO";
            window.atualizarAcaoLogado("EM PATRULHAMENTO");
        }
    }
};

window.refinarRelatoIA = async function (tipo) {
    if (tipo === "aph") {
        const rb = window.val("aph-relato"),
            v = window.val("aph-viatura"),
            lc = window.val("aph-local"),
            p1 = window.val("vtr-p1") || "N/A",
            p2 = window.val("vtr-p2") || "N/A",
            p3 = window.val("vtr-p3") || "N/A",
            p4 = window.val("vtr-p4") || "N/A";
        if (!rb || !v || !lc) return window.sigoNotify("ERRO", "Preencha Viatura, Local e Relato.", "erro");
        const b = window.$("btn-ia-aph");
        b.innerHTML = "[ INICIANDO I.A... ]";
        b.style.pointerEvents = "none";
        let aIA = [];
        aIA.push(`Relato Cru do Agente: "${rb}"`);
        const c = await window.sigoPrompt("[ S.I.G.O. I.A ] Qual a categoria principal do crime?");
        if (c === null) {
            b.innerHTML = "[ REFINAR RELATO (IA) ]";
            b.style.pointerEvents = "auto";
            return window.sigoNotify("ABORTOU", "Cancelado.", "aviso");
        }
        let d1, d2;
        const cl = c.toLowerCase();
        if (cl.includes("tráfico") || cl.includes("droga")) {
            d1 = await window.sigoPrompt("[ NARCO ] Substâncias/quantidades?");
            if (d1 === null) {
                b.innerHTML = "[ REFINAR ]";
                b.style.pointerEvents = "auto";
                return;
            }
            d2 = await window.sigoPrompt("[ NARCO ] Suspeito confessou?");
            if (d2 === null) {
                b.innerHTML = "[ REFINAR ]";
                b.style.pointerEvents = "auto";
                return;
            }
        } else if (cl.includes("roubo") || cl.includes("furto")) {
            d1 = await window.sigoPrompt("[ PATRIMÔNIO ] Bens subtraídos?");
            if (d1 === null) {
                b.innerHTML = "[ REFINAR ]";
                b.style.pointerEvents = "auto";
                return;
            }
            d2 = await window.sigoPrompt("[ PATRIMÔNIO ] Usou arma?");
            if (d2 === null) {
                b.innerHTML = "[ REFINAR ]";
                b.style.pointerEvents = "auto";
                return;
            }
        } else {
            d1 = await window.sigoPrompt("[ GERAL ] Atitude do suspeito?");
            if (d1 === null) {
                b.innerHTML = "[ REFINAR ]";
                b.style.pointerEvents = "auto";
                return;
            }
            d2 = await window.sigoPrompt("[ GERAL ] Houve resistência?");
            if (d2 === null) {
                b.innerHTML = "[ REFINAR ]";
                b.style.pointerEvents = "auto";
                return;
            }
        }
        b.innerHTML = "[ FORMALIZANDO TEXTO... ]";
        setTimeout(() => {
            const dt = new Date().toLocaleDateString("pt-BR");
            const nl = `Aos ${dt}, a guarnição operante na viatura ${v}, composta pelos agentes P1: ${p1}, P2: ${p2}, P3: ${p3} e P4: ${p4}, foi acionada para averiguar ocorrência com indícios de ${c.toUpperCase()} na localidade identificada como ${lc.toUpperCase()}.\n\nAo chegar no local supracitado, a equipe policial constatou a seguinte situação preliminar reportada pelo operador: ${rb}. \n\nDurante o desdobramento e averiguação tática, observou-se materialmente que: ${d1}. Em complemento aos fatos narrados, a equipe registrou o seguinte agravante: ${d2}.\n\nDiante da constatação dos fatos, a situação foi estabilizada e os procedimentos legais foram iniciados de imediato pela equipe.`;
            const cx = window.$("aph-relato");
            cx.value = nl;
            cx.readOnly = true;
            cx.style.backgroundColor = "#080b12";
            cx.style.color = "#4ade80";
            cx.style.border = "1px solid var(--success-green)";
            window.setVal(
                "aph-desfecho",
                "Condução à delegacia para elaboração de polícia judiciária e adoção das medidas cabíveis."
            );
            window.$("aph-desfecho").readOnly = true;
            b.innerHTML = "[ TEXTO FORMALIZADO ]";
            b.style.background = "var(--success-green)";
            b.style.color = "#000";
            const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
            if (typeof window.enviarWebhookAuditoriaIA === "function")
                window.enviarWebhookAuditoriaIA(u.nome, u.passaporte, aIA.join("\n"));
            window.sigoNotify("SUCESSO", "Laudo redigido formalmente.", "sucesso");
        }, 1500);
    } else {
        window.sigoNotify("INFO", "Em desenvolvimento.", "aviso");
    }
};

window.assinarEnviarBOCB = function () {
    const n = window.val("aph-socorrista-nome"),
        p = window.val("aph-socorrista-pass"),
        v = window.val("aph-viatura"),
        a = window.val("aph-area"),
        vn = window.val("aph-vitima-nome"),
        vp = window.val("aph-vitima-pass"),
        l = window.val("aph-local"),
        r = window.val("aph-relato"),
        d = window.val("aph-desfecho");
    if (!v || !a || !vn || !l || !r) return window.sigoNotify("ERRO", "Preencha tudo.", "erro");
    const b = window.$("btn-transmitir");
    if (b) {
        b.innerText = "ENVIANDO...";
        b.style.pointerEvents = "none";
    }
    const pt = "BO-" + Math.floor(100000 + Math.random() * 900000);
    const bo = {
        tipo: "APH",
        protocolo: pt,
        data: new Date().toLocaleString("pt-BR"),
        oficialNome: n,
        oficialPass: p,
        viatura: v,
        area: a,
        vitima: vn,
        vitimaPass: vp,
        local: l,
        relato: r,
        desfecho: d,
        status: "ATIVO",
    };
    let h = JSON.parse(localStorage.getItem("sigo_historico_" + p)) || [];
    h.push(bo);
    localStorage.setItem("sigo_historico_" + p, JSON.stringify(h));
    window.registrarLogInterno("POLICIA", n, p, `Boletim ${pt}`, "BOLETIM");
    window.sigoNotify("ENVIADO", "Anexado à base.", "sucesso");
    window.enviarWebhook(
        WEBHOOKS.APH,
        `📄 NOVO BOLETIM [${pt}]`,
        `**Relator:** ${n} (ID: ${p})\n**VTR:** ${v} | **QTH:** ${l}\n**Envolvido:** ${vn} (ID: ${vp})\n\n**SÍNTESE DOS FATOS:**\n${r}`,
        "#0ea5e9"
    );
    [
        "aph-viatura",
        "aph-vitima-nome",
        "aph-vitima-pass",
        "aph-local",
        "aph-relato",
        "aph-desfecho",
        "vtr-p1",
        "vtr-p2",
        "vtr-p3",
        "vtr-p4",
    ].forEach((x) => window.setVal(x, ""));
    if (window.$("aph-relato")) {
        window.$("aph-relato").readOnly = false;
        window.$("aph-relato").style = "";
        window.$("aph-desfecho").readOnly = false;
        const bia = window.$("btn-ia-aph");
        if (bia) {
            bia.innerHTML = "[ REFINAR RELATO (IA) ]";
            bia.style = "";
            bia.style.pointerEvents = "auto";
        }
    }
    if (b) {
        b.innerHTML = "[ ASSINAR E ENVIAR ARQUIVO AO DISCORD ]";
        b.style.pointerEvents = "auto";
    }
    window.carregarMeusBoletinsPainel();
    window.mudarAba("aba-historico");
};
window.assinarEnviarRUF = function () {
    const n = window.val("aph-socorrista-nome"),
        p = window.val("aph-socorrista-pass"),
        v = window.val("ruf-viatura"),
        l = window.val("ruf-local"),
        nv = window.val("ruf-nivel"),
        ds = window.val("ruf-disparos") || "0",
        ar = window.val("ruf-arma"),
        c = window.val("ruf-caracteristicas"),
        ls = window.val("ruf-lesoes"),
        sc = window.val("ruf-socorro"),
        r = window.val("ruf-relato");
    if (!v || !l || !ar || !c || !r) return window.sigoNotify("ERRO", "Preencha tudo.", "erro");
    const b = window.$("btn-transmitir-ruf");
    if (b) {
        b.innerText = "ENVIANDO...";
        b.style.pointerEvents = "none";
    }
    const pt = "RUF-" + Math.floor(100000 + Math.random() * 900000);
    const bo = {
        tipo: "RUF",
        protocolo: pt,
        data: new Date().toLocaleString("pt-BR"),
        oficialNome: n,
        oficialPass: p,
        viatura: v,
        local: l,
        nivel: nv,
        disparos: ds,
        arma: ar,
        alvo: c,
        lesoes: ls,
        socorro: sc,
        relato: r,
        status: "ATIVO",
    };
    let h = JSON.parse(localStorage.getItem("sigo_historico_" + p)) || [];
    h.push(bo);
    localStorage.setItem("sigo_historico_" + p, JSON.stringify(h));
    window.sigoNotify("ENVIADO", "RUF formalizado.", "sucesso");
    window.enviarWebhook(
        WEBHOOKS.RUF,
        `🔫 RELATÓRIO RUF [${pt}]`,
        `**Operador:** ${n} (ID: ${p})\n**VTR:** ${v} | **QTH:** ${l}\n**Nível Força:** ${nv} | **Disparos:** ${ds}\n**Arma:** ${ar}\n\n**DINÂMICA:**\n${r}`,
        "#b91c1c"
    );
    ["ruf-viatura", "ruf-local", "ruf-disparos", "ruf-arma", "ruf-caracteristicas", "ruf-relato"].forEach((x) =>
        window.setVal(x, "")
    );
    if (b) {
        b.innerHTML = "[ REGISTRAR E ENVIAR ARQUIVO AO DISCORD ]";
        b.style.pointerEvents = "auto";
    }
    window.carregarMeusBoletinsPainel();
    window.mudarAba("aba-historico");
};

window.carregarMeusBoletinsPainel = function () {
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (u) window.renderizarCardsOperacionais(JSON.parse(localStorage.getItem("sigo_historico_" + u.passaporte)) || []);
};
window.filtrarBoletins = function () {
    const t = window.val("busca-boletim").toLowerCase();
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    const mh = JSON.parse(localStorage.getItem("sigo_historico_" + u.passaporte)) || [];
    window.renderizarCardsOperacionais(
        mh.filter(
            (b) =>
                b.protocolo.toLowerCase().includes(t) ||
                b.local.toLowerCase().includes(t) ||
                b.relato.toLowerCase().includes(t)
        )
    );
};
window.renderizarCardsOperacionais = function (l) {
    if (!window.$("lista-meus-boletins")) return;
    const la = l.filter((b) => b.status !== "ARQUIVADO");
    if (la.length === 0)
        return window.html(
            "lista-meus-boletins",
            `<div class="alerta font-mono" style="border-left-color:#334155;background:#0f172a;color:#64748b;">NENHUM REGISTRO ATIVO.</div>`
        );
    let h = "";
    [...la].reverse().forEach((b) => {
        let c = b.tipo === "RUF" ? "var(--bombeiro-dark)" : "var(--pm-blue)",
            t = b.tipo === "RUF" ? "[ RUF ]" : "[ BO ]";
        h += `<div class="card-boletim step-animado" style="border-left-color:${c};" onclick="abrirBoletimPainel('${b.protocolo}','${b.oficialPass}')"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;font-weight:800;color:#f8fafc;">${t} ${b.protocolo}</span><span style="font-size:10px;color:#64748b;">${b.data}</span></div><p style="font-size:11px;color:#cbd5e1;">QTH: ${b.local}</p></div>`;
    });
    window.html("lista-meus-boletins", h);
};

window.abrirBoletimPainel = function (pt, po = null) {
    if (!po) po = JSON.parse(sessionStorage.getItem("sigo_oficial_logado")).passaporte;
    const b = (JSON.parse(localStorage.getItem("sigo_historico_" + po)) || []).find((x) => x.protocolo === pt);
    if (b) {
        window.txt("modal-protocolo", b.protocolo);
        const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
        let dtS = b.data.split(" ")[0];
        let h = `<div id="documento-print" style="width:800px; background:#fff; color:#000; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; padding:50px; margin:0 auto; position:relative; box-sizing:border-box;">`;
        h += `<div style="position:absolute; top:0; left:0; width:100%; height:15px; background:linear-gradient(90deg, #b91c1c 0%, #1e293b 100%);"></div>`;
        h += `<div style="text-align:center; margin-bottom:40px; margin-top:10px;"><img src="${cf.brasao}" style="width:80px; margin-bottom:15px;"><h2 style="margin:0; font-size:22px; font-weight:900; color:#0f172a; text-transform:uppercase;">${cf.nome}</h2><p style="margin:5px 0 15px 0; font-size:14px; font-weight:bold; color:#475569;">DEPARTAMENTO DE POLÍCIA JUDICIÁRIA</p><h3 style="margin:0; font-size:16px; border:2px solid #b91c1c; display:inline-block; padding:8px 20px; color:#b91c1c;">AUTOS DO PROTOCOLO: ${b.protocolo}</h3></div>`;
        h += `<p style="text-align:right; font-size:12px; font-weight:bold; color:#64748b; border-bottom:1px solid #cbd5e1; padding-bottom:5px; margin-bottom:25px;">REGISTRADO EM: ${dtS} - CÓPIA AUTENTICADA</p>`;
        if (b.tipo === "APH") {
            h += `<div style="background:#f8fafc; border-left:4px solid #1e293b; padding:15px; margin-bottom:30px;"><p style="margin:5px 0; font-size:14px;"><strong>OFICIAL REDATOR:</strong> ${b.oficialNome} (MATRÍCULA: ${b.oficialPass})</p><p style="margin:5px 0; font-size:14px;"><strong>VIATURA / QTH:</strong> ${b.viatura} - ${b.local}</p><p style="margin:5px 0; font-size:14px;"><strong>ENVOLVIDO PRINCIPAL:</strong> ${b.vitima} (RG: ${b.vitimaPass})</p></div>`;
            h += `<h4 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:5px; margin-top:30px; font-size:16px;">I. NARRATIVA E SÍNTESE DOS FATOS</h4><div style="font-size:14px; line-height:1.8; text-align:justify; white-space:pre-wrap; margin-bottom:30px; color:#1e293b;">${b.relato}</div>`;
            h += `<h4 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:5px; margin-top:30px; font-size:16px;">II. DESFECHO TÁTICO E PROVIDÊNCIAS</h4><div style="font-size:14px; line-height:1.8; text-align:justify; white-space:pre-wrap; color:#1e293b;">${b.desfecho}</div>`;
        } else {
            h += `<div style="background:#f8fafc; border-left:4px solid #b91c1c; padding:15px; margin-bottom:30px;"><p style="margin:5px 0; font-size:14px;"><strong>AGENTE OPERADOR:</strong> ${b.oficialNome} (MATRÍCULA: ${b.oficialPass})</p><p style="margin:5px 0; font-size:14px;"><strong>VIATURA / QTH:</strong> ${b.viatura} - ${b.local}</p><p style="margin:5px 0; font-size:14px;"><strong>NÍVEL DA FORÇA:</strong> ${b.nivel} | <strong>DISPAROS:</strong> ${b.disparos}</p><p style="margin:5px 0; font-size:14px;"><strong>ARMAMENTO:</strong> ${b.arma}</p></div>`;
            h += `<h4 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:5px; margin-top:30px; font-size:16px;">I. QUALIFICAÇÃO DO OPOSITOR</h4><div style="font-size:14px; line-height:1.8; text-align:justify; white-space:pre-wrap; margin-bottom:30px; color:#1e293b;">${b.alvo}</div>`;
            h += `<h4 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:5px; margin-top:30px; font-size:16px;">II. DINÂMICA DA INTERVENÇÃO</h4><div style="font-size:14px; line-height:1.8; text-align:justify; white-space:pre-wrap; margin-bottom:30px; color:#1e293b;">${b.relato}</div>`;
            h += `<h4 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:5px; margin-top:30px; font-size:16px;">III. SALVAMENTO E LESÕES</h4><div style="font-size:14px; line-height:1.8; text-align:justify; white-space:pre-wrap; color:#1e293b;"><strong>LESÕES:</strong> ${b.lesoes}<br><strong>SOCORRO:</strong> ${b.socorro}</div>`;
        }
        h += `<div style="margin-top:70px; text-align:center;"><p style="font-style:italic; font-size:14px; color:#b91c1c; font-weight:bold;">"Publique-se, Registre-se e Cumpra-se."</p></div>`;
        h += `<div style="margin-top:60px; text-align:center;"><p style="font-family:'Brush Script MT', 'Dancing Script', cursive; font-size:32px; margin:0; color:#0369a1;">${b.oficialNome}</p><hr style="width:300px; border:none; border-top:1px solid #000; margin:5px auto;"><p style="margin:0; font-size:12px; font-weight:800; text-transform:uppercase; color:#0f172a;">${b.oficialNome}<br><span style="color:#64748b;">ID FUNCIONAL: ${b.oficialPass}</span></p></div>`;
        h += `</div>`;
        window.html("conteudo-modal-dinamico", h);
        window.$("conteudo-modal-dinamico").style.background = "#cbd5e1";
        window.$("conteudo-modal-dinamico").style.padding = "20px 0";
        window.shw("modal-boletim");
    }
};
window.prepararEnvioDiscordDoModal = function () {
    const pt = window.$("modal-protocolo").innerText;
    let tw = pt.includes("RUF") ? "RUF" : "APH";
    window.enviarImagemDiscord("documento-print", `${pt}.png`, tw, `Autos Oficiais - ${pt}`);
};
window.solicitarAlteracao = async function (te) {
    const pt = window.$("modal-protocolo") ? window.$("modal-protocolo").innerText : "";
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    const m = await window.sigoPrompt(`Justificativa para ${te} do DOC ${pt}:`);
    if (!m) return;
    const sl = JSON.parse(localStorage.getItem("sigo_solicitacoes")) || [];
    sl.push({
        id: "SOL-" + Math.floor(1000 + Math.random() * 9000),
        protocolo: pt,
        tipo: te,
        oficial: `${u.patente} ${u.nome}`,
        oficialPass: u.passaporte,
        motivo: m,
        data: new Date().toLocaleString("pt-BR"),
        status: "PENDENTE",
    });
    localStorage.setItem("sigo_solicitacoes", JSON.stringify(sl));
    window.sigoNotify("ENVIADO", "Pedido de Corregedoria gerado.", "sucesso");
    window.hid("modal-boletim");
};

window.expedirMandadoPrisao = function () {
    const p = window.val("mandado-passaporte"),
        m = window.val("mandado-motivo"),
        pr = window.val("mandado-perigo");
    if (!p || !m) return window.sigoNotify("ERRO", "Informe ID e Artigos.", "erro");
    const dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    if (!dc[p]) return window.sigoNotify("ERRO", "Não existe na base.", "erro");
    const ms = JSON.parse(localStorage.getItem("sigo_db_mandados")) || [];
    if (ms.some((x) => x.passaporte === p && x.status === "ATIVO"))
        return window.sigoNotify("ERRO", "Mandado já ativo.", "erro");
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    ms.push({
        id: "MAND-" + Math.floor(10000 + Math.random() * 90000),
        passaporte: p,
        nomeCivil: dc[p].nome,
        motivo: m,
        perigo: pr,
        emissor: `${u.patente} ${u.nome}`,
        data: new Date().toLocaleString("pt-BR"),
        status: "ATIVO",
    });
    localStorage.setItem("sigo_db_mandados", JSON.stringify(ms));
    window.registrarLogInterno("POLICIA", u.nome, u.passaporte, `Mandado ID ${p}`, "INVESTIGACAO");
    window.enviarWebhook(
        WEBHOOKS.INVESTIGACAO,
        `🚨 MANDADO EMITIDO`,
        `**Emissor:** ${u.patente} ${u.nome}\n**Alvo ID:** ${p}\n**Motivo:** ${m}`,
        "#b91c1c"
    );
    window.sigoNotify("ATIVO", "Adicionado aos procurados.", "sucesso");
    window.setVal("mandado-passaporte", "");
    window.setVal("mandado-motivo", "");
    window.renderizarProcurados();
};
window.renderizarProcurados = function () {
    if (!window.$("lista-procurados-ativos")) return;
    const ms = (JSON.parse(localStorage.getItem("sigo_db_mandados")) || []).filter((x) => x.status === "ATIVO");
    if (ms.length === 0)
        return window.html(
            "lista-procurados-ativos",
            `<p class="font-mono" style="font-size:10px; color:#64748b;">Nenhum procurado.</p>`
        );
    let h = "";
    ms.reverse().forEach((x) => {
        let c = x.perigo === "ALTO" ? "var(--bombeiro-red)" : "#f97316";
        h += `<div style="background:#080b12;border-left:3px solid ${c};padding:15px;margin-bottom:10px;border-radius:3px;"><span style="color:${c};font-size:12px;font-weight:800;">PROCURADO: ${x.nomeCivil}</span><br><span style="font-size:10px;color:#f8fafc;">ID: ${x.passaporte}</span><p style="font-size:10px;color:#cbd5e1;margin-top:5px;">Crimes: ${x.motivo}</p><button class="btn-neutro font-mono" style="padding:8px;font-size:9px;width:100%;margin-top:12px;color:var(--success-green);border-color:var(--success-green);" onclick="revogarMandado('${x.id}')">[ REGISTRAR PRISÃO ]</button></div>`;
    });
    window.html("lista-procurados-ativos", h);
};
window.revogarMandado = async function (id) {
    const c = await window.sigoConfirm("Baixar mandado (Registrar prisão)?");
    if (!c) return;
    let ms = JSON.parse(localStorage.getItem("sigo_db_mandados")) || [];
    const m = ms.find((x) => x.id === id);
    if (m) {
        m.status = "CUMPRIDO";
        localStorage.setItem("sigo_db_mandados", JSON.stringify(ms));
        window.sigoNotify("BAIXADO", "Prisão registrada.", "sucesso");
        window.renderizarProcurados();
        window.hid("alerta-procurado-global");
    }
};
window.verificarMandadoPrisaoPainel = function (p) {
    if (!p) return;
    const at = (JSON.parse(localStorage.getItem("sigo_db_mandados")) || []).find(
        (x) => x.passaporte === p && x.status === "ATIVO"
    );
    const a = window.$("alerta-procurado-global");
    if (a) {
        if (at) {
            a.innerHTML = `[!!!] INDIVÍDUO (ID: ${p}) POSSUI MANDADO [!!!]`;
            a.classList.remove("hidden");
            let ctx = new (window.AudioContext || window.webkitAudioContext)();
            let o = ctx.createOscillator();
            o.type = "square";
            o.frequency.setValueAtTime(800, ctx.currentTime);
            o.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.5);
        } else a.classList.add("hidden");
    }
};

window.mudarSubAbaDetran = function (sa) {
    ["sub-detran-consulta", "sub-detran-registro", "sub-detran-pagamentos"].forEach(window.hid);
    ["btn-sub-consulta", "btn-sub-registro", "btn-sub-pagamentos"].forEach((i) => {
        if (window.$(i)) window.$(i).classList.remove("ativo");
    });
    window.shw("sub-detran-" + sa);
    if (window.$("btn-sub-" + sa)) window.$("btn-sub-" + sa).classList.add("ativo");
    if (sa === "pagamentos") window.renderizarMultasParaBaixa();
};
window.consultarPlacaPolicial = function () {
    const pl = window.val("busca-placa-detran").toUpperCase();
    if (pl.length < 7) return window.sigoNotify("ERRO", "Placa inválida.", "erro");
    const v = (JSON.parse(localStorage.getItem("sigo_db_veiculos")) || {})[pl],
        c = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    if (!v) {
        window.hid("resultado-placa-policia");
        return window.sigoNotify("SINESP", "Não encontrado.", "erro");
    }
    placaEmConsulta = v.placa;
    window.txt("res-placa", v.placa);
    window.txt(
        "res-proprietario",
        (c[v.proprietario] ? c[v.proprietario].nome : "DESCONHECIDO") + ` (ID: ${v.proprietario})`
    );
    window.txt("res-modelo", `${v.modelo} | COR: ${v.cor}`);
    if (v.status === "APREENDIDO") {
        window.html("res-status-badge", `<span class="status-badge bad">APREENDIDO</span>`);
        window.shw("btn-liberar-patio");
    } else {
        window.html("res-status-badge", `<span class="status-badge ok">REGULAR</span>`);
        window.hid("btn-liberar-patio");
    }
    window.shw("resultado-placa-policia");
    window.sigoNotify("SINESP", "Localizado.", "sucesso");
    window.verificarMandadoPrisaoPainel(v.proprietario);
};
window.aplicarAutuacaoVeiculo = function () {
    if (!placaEmConsulta) return;
    const m = window.val("autuacao-motivo"),
        vl = window.val("autuacao-valor"),
        ap = window.val("autuacao-apreensao"),
        u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (!m || !vl) return window.sigoNotify("ERRO", "Preencha tudo.", "erro");
    const dv = JSON.parse(localStorage.getItem("sigo_db_veiculos")) || {},
        dm = JSON.parse(localStorage.getItem("sigo_db_multas")) || [];
    dm.push({
        id: "M-" + Math.floor(10000 + Math.random() * 90000),
        passaporte: dv[placaEmConsulta].proprietario,
        placa: placaEmConsulta,
        motivo: m.toUpperCase(),
        valor: vl,
        oficial: `${u.patente} ${u.nome}`,
        data: new Date().toLocaleString("pt-BR"),
        status: "PENDENTE",
    });
    localStorage.setItem("sigo_db_multas", JSON.stringify(dm));
    if (ap === "SIM") {
        dv[placaEmConsulta].status = "APREENDIDO";
        localStorage.setItem("sigo_db_veiculos", JSON.stringify(dv));
    }
    window.enviarWebhook(
        WEBHOOKS.DETRAN,
        "📋 INFRAÇÃO RODOVIÁRIA",
        `**Placa:** ${placaEmConsulta}\n**Valor:** R$ ${vl},00\n**Agente:** ${u.nome}`,
        "#ca8a04"
    );
    window.sigoNotify("AUTUADO", "Multa lançada.", "sucesso");
    window.setVal("autuacao-motivo", "");
    window.setVal("autuacao-valor", "");
    window.consultarPlacaPolicial();
};
window.liberarVeiculoPatio = function () {
    if (!placaEmConsulta) return;
    const dv = JSON.parse(localStorage.getItem("sigo_db_veiculos")) || {};
    dv[placaEmConsulta].status = "REGULAR";
    localStorage.setItem("sigo_db_veiculos", JSON.stringify(dv));
    window.sigoNotify("PÁTIO", "Liberado.", "sucesso");
    window.consultarPlacaPolicial();
};
window.registrarVeiculoBanco = function () {
    const p = window.val("reg-veiculo-passaporte"),
        pl = window.val("reg-veiculo-placa").toUpperCase(),
        m = window.val("reg-veiculo-modelo"),
        c = window.val("reg-veiculo-cor");
    if (!p || pl.length < 7 || !m || !c) return window.sigoNotify("ERRO", "Inválido.", "erro");
    const dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {},
        dv = JSON.parse(localStorage.getItem("sigo_db_veiculos")) || {};
    if (!dc[p] || dv[pl]) return window.sigoNotify("ERRO", "ID falso ou Placa existe.", "erro");
    dv[pl] = {
        placa: pl,
        proprietario: p,
        modelo: m,
        cor: c,
        status: "REGULAR",
        dataRegistro: new Date().toLocaleString("pt-BR"),
    };
    localStorage.setItem("sigo_db_veiculos", JSON.stringify(dv));
    window.sigoNotify("SUCESSO", "Emplacado.", "sucesso");
    ["reg-veiculo-passaporte", "reg-veiculo-placa", "reg-veiculo-modelo", "reg-veiculo-cor"].forEach((x) =>
        window.setVal(x, "")
    );
};
window.renderizarMultasParaBaixa = function () {
    if (!window.$("lista-multas-analise")) return;
    const ab = (JSON.parse(localStorage.getItem("sigo_db_multas")) || []).filter(
        (x) => x.status === "AGUARDANDO_BAIXA"
    );
    if (ab.length === 0)
        return window.html(
            "lista-multas-analise",
            `<p class="font-mono" style="color:#64748b;font-size:11px;">Nenhuma pendência.</p>`
        );
    let h = "";
    ab.forEach((m) => {
        h += `<div class="card-multa" style="border-color:var(--warning-yellow); display:flex; justify-content:space-between; align-items:center;"><div class="multa-info"><h5 style="color:var(--warning-yellow); font-size:14px;">${m.motivo}</h5><p style="color:#e2e8f0; font-size:11px;">Placa: ${m.placa}</p><p style="color:#cbd5e1; font-size:10px;">R$ ${m.valor},00</p></div><button class="btn-neutro font-mono" style="background:var(--success-green); color:#000; padding:10px; font-size:9px;" onclick="aprovarBaixaMulta('${m.id}')">[ APROVAR ]</button></div>`;
    });
    window.html("lista-multas-analise", h);
};
window.aprovarBaixaMulta = async function (id) {
    const c = await window.sigoConfirm("Aprovar baixa?");
    if (!c) return;
    let dm = JSON.parse(localStorage.getItem("sigo_db_multas")) || [];
    const i = dm.findIndex((x) => x.id === id);
    if (i > -1) {
        dm.splice(i, 1);
        localStorage.setItem("sigo_db_multas", JSON.stringify(dm));
        window.sigoNotify("BAIXADA", "Removida.", "sucesso");
        window.renderizarMultasParaBaixa();
    }
};

window.emitirLicencaCivil = function () {
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (u.tipo !== "PF" && u.tipo !== "ADMIN" && u.tipo !== "DEV")
        return window.sigoNotify("NEGADO", "Apenas PF.", "erro");
    const p = window.val("licenca-passaporte"),
        t = window.val("licenca-tipo"),
        ar = window.val("licenca-arma"),
        m = window.val("licenca-municao"),
        v = window.val("licenca-validade"),
        o = window.val("licenca-obs");
    if (!p || !v || !o) return window.sigoNotify("ERRO", "Preencha.", "erro");
    const dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    if (!dc[p]) return window.sigoNotify("ERRO", "Não achado.", "erro");
    const dl = JSON.parse(localStorage.getItem("sigo_db_licencas")) || [];
    const pt = "CRAF-" + Math.floor(10000 + Math.random() * 90000);
    dl.push({
        id: pt,
        passaporte: p,
        tipo: t,
        arma: ar,
        municao: m,
        validade: v.split("-").reverse().join("/"),
        obs: o,
        emissor: `${u.patente} ${u.nome}`,
        data: new Date().toLocaleString("pt-BR"),
    });
    localStorage.setItem("sigo_db_licencas", JSON.stringify(dl));
    window.sigoNotify("CRIADO", "Salvo.", "sucesso");
    window.setVal("licenca-passaporte", "");
    window.setVal("licenca-obs", "");
    window.renderizarLicencasPainel();
};
window.renderizarLicencasPainel = function () {
    if (!window.$("lista-licencas-ativas")) return;
    const dl = JSON.parse(localStorage.getItem("sigo_db_licencas")) || [],
        t = window.val("busca-licencas"),
        f = dl.filter((x) => x.passaporte.includes(t));
    if (f.length === 0)
        return window.html(
            "lista-licencas-ativas",
            `<p class="font-mono" style="font-size:10px; color:#64748b;">Nada achado.</p>`
        );
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado")),
        pe = u && (u.tipo === "PF" || u.tipo === "ADMIN" || u.tipo === "DEV");
    let h = "";
    f.reverse().forEach((x) => {
        let br = pe
            ? `<button class="btn-perigo font-mono" style="padding:8px; font-size:9px; width:100%; margin-top:12px;" onclick="revogarLicenca('${x.id}')">[ REVOGAR ]</button>`
            : "";
        h += `<div style="background:#080b12; border-left:3px solid #38bdf8; padding:15px; margin-bottom:10px; border-radius:3px;"><span style="color:#38bdf8; font-size:12px; font-weight:800;">${x.tipo}</span><br><span style="font-size:10px; color:#f8fafc;">ID: ${x.passaporte}</span><p style="font-size:10px; color:#cbd5e1; margin-top:10px;">Val: ${x.validade}</p>${br}</div>`;
    });
    window.html("lista-licencas-ativas", h);
};
window.revogarLicenca = async function (id) {
    const c = await window.sigoConfirm("Revogar?");
    if (!c) return;
    let dl = JSON.parse(localStorage.getItem("sigo_db_licencas")) || [];
    dl = dl.filter((x) => x.id !== id);
    localStorage.setItem("sigo_db_licencas", JSON.stringify(dl));
    window.sigoNotify("REVOGADA", "Cassada.", "sucesso");
    window.renderizarLicencasPainel();
};

window.renderizarBOCivisParaAnalise = function () {
    if (!window.$("lista-bos-civis-analise")) return;
    const ba = (JSON.parse(localStorage.getItem("sigo_bos_civis")) || []).filter((x) => x.status === "EM ANÁLISE");
    if (ba.length === 0)
        return window.html(
            "lista-bos-civis-analise",
            `<p class="font-mono" style="color:#64748b;">Zero BOs Civis.</p>`
        );
    let h = "";
    ba.forEach((b) => {
        h += `<div style="background:#080b12; border-left:3px solid #38bdf8; padding:15px; margin-bottom:10px; border-radius:3px;"><span style="color:#38bdf8; font-size:12px; font-weight:800;">[ BO ONLINE ] ${b.tipo}</span><br><span style="font-size:10px; color:#f8fafc;">VÍTIMA: ${b.civilPass}</span><div style="background:#fff; border:1px solid #cbd5e1; padding:10px; border-radius:3px; font-size:11px; color:#334155; margin-top:10px; margin-bottom:15px;">"${b.relato}"</div><div style="display:flex; gap:10px;"><button class="btn-neutro font-mono" style="background:var(--success-green); color:#000;" onclick="aprovarBOCivil('${b.id}')">[ VALIDAR ]</button><button class="btn-perigo font-mono" onclick="rejeitarBOCivil('${b.id}')">[ REJEITAR ]</button></div></div>`;
    });
    window.html("lista-bos-civis-analise", h);
};
window.aprovarBOCivil = async function (id) {
    const c = await window.sigoConfirm("Validar B.O.?");
    if (!c) return;
    let bs = JSON.parse(localStorage.getItem("sigo_bos_civis")) || [];
    const b = bs.find((x) => x.id === id);
    if (b) {
        b.status = "VALIDADO";
        localStorage.setItem("sigo_bos_civis", JSON.stringify(bs));
        window.sigoNotify("VALIDADO", "BO Legalizado.", "sucesso");
        window.renderizarBOCivisParaAnalise();
    }
};
window.rejeitarBOCivil = async function (id) {
    const m = await window.sigoPrompt("Motivo:");
    if (!m) return;
    let bs = JSON.parse(localStorage.getItem("sigo_bos_civis")) || [];
    const b = bs.find((x) => x.id === id);
    if (b) {
        b.status = "REJEITADO";
        localStorage.setItem("sigo_bos_civis", JSON.stringify(bs));
        window.sigoNotify("REJEITADO", "Arquivado.", "aviso");
        window.renderizarBOCivisParaAnalise();
    }
};

window.carregarDadosAdmin = function () {
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (!u || (u.tipo !== "ADMIN" && u.tipo !== "DEV")) return (window.location.href = "index.html");
    if (window.$("topbar-nome-admin")) window.txt("topbar-nome-admin", u.patente + " " + u.nome);
    if (typeof window.renderizarEfetivo === "function") window.renderizarEfetivo("TODOS");
    if (typeof window.renderizarAuditoria === "function") window.renderizarAuditoria();
    if (typeof window.renderizarSolicitacoes === "function") window.renderizarSolicitacoes();
    if (window.$("lista-interruptores")) window.renderizarInterruptores();
    if (window.$("config-sigla")) {
        const cf = JSON.parse(localStorage.getItem("sigo_global_ui")) || DEFAULT_CONFIG;
        window.setVal("config-sigla", cf.sigla);
        window.setVal("config-nome", cf.nome);
        window.setVal("config-brasao", cf.brasao);
    }
    window.atualizarDashboard();
    if (localStorage.getItem("sigo_manutencao") === "true" && window.$("btn-toggle-manutencao")) {
        window.$("btn-toggle-manutencao").classList.add("ativa");
        window.$("btn-toggle-manutencao").innerText = "[ ATIVAR REDE ]";
    }
};
window.mudarAbaAdmin = function (id) {
    [
        "aba-dashboard",
        "aba-efetivo",
        "aba-batalhoes",
        "aba-auditoria",
        "aba-solicitacoes",
        "aba-logs",
        "aba-config",
    ].forEach(window.hid);
    [
        "btn-aba-dashboard",
        "btn-aba-efetivo",
        "btn-aba-batalhoes",
        "btn-aba-auditoria",
        "btn-aba-solicitacoes",
        "btn-aba-logs",
        "btn-aba-config",
    ].forEach((i) => {
        if (window.$(i)) window.$(i).classList.remove("ativo");
    });
    window.shw(id);
    if (window.$("btn-" + id)) window.$("btn-" + id).classList.add("ativo");
    if (id === "aba-solicitacoes") window.renderizarSolicitacoes();
    if (id === "aba-dashboard") window.atualizarDashboard();
    if (id === "aba-logs") window.renderizarLogsAdmin();
    if (id === "aba-batalhoes") window.renderizarBatalhoes();
};
window.atualizarDashboard = function () {
    if (!window.$("stat-efetivo")) return;
    const dm = JSON.parse(localStorage.getItem("sigo_db_usuarios")) || {},
        dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {};
    window.txt("stat-efetivo", Object.keys(dm).length);
    if (window.$("stat-civis")) window.txt("stat-civis", Object.keys(dc).length);
    window.txt("stat-batalhoes", (JSON.parse(localStorage.getItem("sigo_db_batalhoes")) || []).length);
    let tb = 0;
    Object.keys(dm).forEach((p) => {
        tb += (JSON.parse(localStorage.getItem("sigo_historico_" + p)) || []).length;
    });
    window.txt("stat-boletins", tb);
};
window.alternarManutencao = async function () {
    const c = await window.sigoConfirm("Alternar status da rede governamental?");
    if (!c) return;
    const b = window.$("btn-toggle-manutencao");
    if (localStorage.getItem("sigo_manutencao") === "true") {
        localStorage.setItem("sigo_manutencao", "false");
        b.classList.remove("ativa");
        b.innerText = "[ DESATIVAR REDE ]";
        window.sigoNotify("SISTEMA", "Rede Online.", "sucesso");
    } else {
        localStorage.setItem("sigo_manutencao", "true");
        b.classList.add("ativa");
        b.innerText = "[ ATIVAR REDE ]";
        window.sigoNotify("SISTEMA", "Rede em Manutenção.", "aviso");
    }
};
window.setFiltro = function (tf, btn) {
    filtroAtual = tf;
    document.querySelectorAll(".btn-filtro").forEach((x) => {
        if (!x.id.includes("log") && !x.id.includes("sub")) x.classList.remove("ativo");
    });
    btn.classList.add("ativo");
    window.renderizarEfetivo(tf);
};
window.renderizarEfetivo = function (tf = filtroAtual) {
    if (!window.$("lista-efetivo")) return;
    const dm = JSON.parse(localStorage.getItem("sigo_db_usuarios")) || {},
        dc = JSON.parse(localStorage.getItem("sigo_db_civis")) || {},
        tx = window.val("busca-efetivo").toLowerCase();
    let hc = "";
    Object.values(dm).forEach((u) => {
        if ((tf === "TODOS" || u.tipo === tf) && (u.nome.toLowerCase().includes(tx) || u.passaporte.includes(tx))) {
            let cc = u.tipo === "ADMIN" ? "var(--admin-gold)" : u.tipo === "DEV" ? "#c084fc" : "var(--pm-blue)";
            let sd = u.online ? '<span class="status-dot online"></span>' : '<span class="status-dot offline"></span>';
            hc += `<div class="card-user" style="border-top:3px solid ${cc};" onclick="abrirPerfilUsuario('${u.passaporte}','MILITAR')"><div class="card-user-header"><span class="user-pass">ID: ${u.passaporte}</span><span class="user-tipo">${u.tipo}</span></div><p class="user-nome">${sd} ${u.nome}</p></div>`;
        }
    });
    if (tf === "TODOS" || tf === "CIVIL") {
        Object.values(dc).forEach((c) => {
            if (c.nome.toLowerCase().includes(tx) || c.passaporte.includes(tx)) {
                hc += `<div class="card-user" style="border-top:3px solid var(--success-green);" onclick="abrirPerfilUsuario('${c.passaporte}','CIVIL')"><div class="card-user-header"><span class="user-pass">ID: ${c.passaporte}</span><span class="user-tipo">CIDADÃO</span></div><p class="user-nome">${c.nome}</p></div>`;
            }
        });
    }
    window.html("lista-efetivo", hc);
};

window.abrirModalUsuario = function () {
    window.txt("titulo-modal-user", "EMITIR ACESSO");
    window.setVal("cad-user-pass", "");
    if (window.$("cad-user-pass")) window.$("cad-user-pass").disabled = false;
    ["cad-user-pin", "cad-user-pos", "cad-user-nome", "cad-user-patente", "cad-user-corp", "cad-user-foto"].forEach(
        (i) => window.setVal(i, "")
    );
    window.shw("modal-cad-usuario");
};
window.fecharModalUsuario = function () {
    window.hid("modal-cad-usuario");
};
window.salvarUsuario = function () {
    const p = window.val("cad-user-pass"),
        s = window.val("cad-user-pin"),
        ps = window.val("cad-user-pos"),
        n = window.val("cad-user-nome"),
        t = window.val("cad-user-tipo"),
        pt = window.val("cad-user-patente"),
        cp = window.val("cad-user-corp"),
        f = window.val("cad-user-foto");
    if (!p || !s || !n) return window.sigoNotify("ERRO", "Campos obrigatórios vazios.", "erro");
    if ((t === "ADMIN" || t === "DEV") && !ps) return window.sigoNotify("ERRO", "Pós-senha necessária.", "erro");
    const db = JSON.parse(localStorage.getItem("sigo_db_usuarios")) || {};
    let nvo = !db[p];
    db[p] = {
        passaporte: p,
        senha: s,
        posSenha: ps || "123",
        nome: n,
        tipo: t,
        patente: pt,
        corp: cp,
        foto: f || DEFAULT_CONFIG.brasao,
        status: nvo ? "ATIVO" : db[p].status,
        ip: nvo ? gerarIPFake() : db[p].ip,
        online: nvo ? false : db[p].online,
        ultimaAcao: nvo ? "CRIADO" : db[p].ultimaAcao,
    };
    localStorage.setItem("sigo_db_usuarios", JSON.stringify(db));
    window.fecharModalUsuario();
    window.renderizarEfetivo();
    window.atualizarDashboard();
    window.sigoNotify("SALVO", "Oficial registrado com sucesso.", "sucesso");
};
window.abrirPerfilUsuario = function (p, tc) {
    if (!window.$("conteudo-perfil-usuario")) return;
    if (tc === "MILITAR") {
        const u = JSON.parse(localStorage.getItem("sigo_db_usuarios"))[p];
        let tb = u.status === "ATIVO" ? "[ SUSPENDER ]" : "[ REATIVAR ]";
        window.html(
            "conteudo-perfil-usuario",
            `<div style="display:flex; gap:20px; align-items:center; margin-bottom:20px;"><img src="${u.foto}" style="width:80px;"><div style="flex:1;"><h4>${u.nome}</h4><p>${u.passaporte} - ${u.tipo}</p></div></div><div class="botoes-modal"><button class="btn-neutro" onclick="editarUsuarioDoPerfil('${u.passaporte}')">[ EDITAR ]</button><button class="btn-neutro" style="color:var(--warning-yellow);" onclick="alternarStatusUsuario('${u.passaporte}','MILITAR')">${tb}</button><button class="btn-perigo" onclick="excluirUsuarioPermanente('${u.passaporte}','MILITAR')">[ EXCLUIR ]</button></div>`
        );
    } else {
        const c = JSON.parse(localStorage.getItem("sigo_db_civis"))[p];
        let tbc = c.status === "SUSPENSO" ? "[ REATIVAR ]" : "[ BLOQUEAR ]";
        window.html(
            "conteudo-perfil-usuario",
            `<div style="display:flex; gap:20px; align-items:center; margin-bottom:20px;"><img src="${c.foto}" style="width:80px;"><div style="flex:1;"><h4>${c.nome}</h4><p>${c.passaporte} (CIDADÃO)</p></div></div><div class="botoes-modal"><button class="btn-neutro" onclick="mudarFotoCivil('${c.passaporte}')">[ FOTO ]</button><button class="btn-neutro" style="color:var(--warning-yellow);" onclick="alternarStatusUsuario('${c.passaporte}','CIVIL')">${tbc}</button><button class="btn-perigo" onclick="excluirUsuarioPermanente('${c.passaporte}','CIVIL')">[ EXCLUIR ]</button></div>`
        );
    }
    window.shw("modal-perfil-usuario");
};
window.editarUsuarioDoPerfil = function (p) {
    window.hid("modal-perfil-usuario");
    const u = JSON.parse(localStorage.getItem("sigo_db_usuarios"))[p];
    window.txt("titulo-modal-user", "ATUALIZAR");
    window.setVal("cad-user-pass", u.passaporte);
    if (window.$("cad-user-pass")) window.$("cad-user-pass").disabled = true;
    window.setVal("cad-user-pin", u.senha);
    window.setVal("cad-user-pos", u.posSenha);
    window.setVal("cad-user-nome", u.nome);
    window.setVal("cad-user-tipo", u.tipo);
    window.setVal("cad-user-patente", u.patente);
    window.setVal("cad-user-corp", u.corp);
    window.setVal("cad-user-foto", u.foto === DEFAULT_CONFIG.brasao ? "" : u.foto);
    window.shw("modal-cad-usuario");
};
window.mudarFotoCivil = async function (p) {
    const url = await window.sigoPrompt("URL da nova foto:");
    if (!url) return;
    const db = JSON.parse(localStorage.getItem("sigo_db_civis"));
    db[p].foto = url;
    localStorage.setItem("sigo_db_civis", JSON.stringify(db));
    window.abrirPerfilUsuario(p, "CIVIL");
};

window.alternarStatusUsuario = async function (p, tc) {
    if (p === "3447" || p === "0000")
        return window.sigoNotify("NEGADO", "Este usuário possui blindagem de sistema.", "erro");
    const c = await window.sigoConfirm(
        tc === "MILITAR" ? "Alterar acesso deste Oficial?" : "Bloquear acesso deste Cidadão?"
    );
    if (!c) return;
    const db =
        tc === "MILITAR"
            ? JSON.parse(localStorage.getItem("sigo_db_usuarios"))
            : JSON.parse(localStorage.getItem("sigo_db_civis"));
    if (db[p]) {
        db[p].status = db[p].status === "ATIVO" ? "SUSPENSO" : "ATIVO";
        tc === "MILITAR"
            ? localStorage.setItem("sigo_db_usuarios", JSON.stringify(db))
            : localStorage.setItem("sigo_db_civis", JSON.stringify(db));
        window.hid("modal-perfil-usuario");
        window.renderizarEfetivo();
        window.sigoNotify("STATUS ATUALIZADO", `Acesso alterado para ${db[p].status}.`, "aviso");
        window.registrarLogInterno("ADMIN", "Comando", p, `Alterou status para ${db[p].status}`, "SISTEMA");
    }
};
window.excluirUsuarioPermanente = async function (p, tc) {
    if (p === "3447" || p === "0000") return window.sigoNotify("NEGADO", "Usuário blindado.", "erro");
    const c = await window.sigoConfirm("EXCLUSÃO PERMANENTE. O usuário sumirá da base. Confirma?");
    if (!c) return;
    const db =
        tc === "MILITAR"
            ? JSON.parse(localStorage.getItem("sigo_db_usuarios"))
            : JSON.parse(localStorage.getItem("sigo_db_civis"));
    if (db[p]) {
        delete db[p];
        tc === "MILITAR"
            ? localStorage.setItem("sigo_db_usuarios", JSON.stringify(db))
            : localStorage.setItem("sigo_db_civis", JSON.stringify(db));
        window.hid("modal-perfil-usuario");
        window.renderizarEfetivo();
        window.atualizarDashboard();
        window.sigoNotify("DELETADO", "Registro completamente obliterado da base.", "sucesso");
        window.registrarLogInterno("ADMIN", "Comando", p, `Excluiu registro do ID ${p}`, "SISTEMA");
    }
};

window.adicionarBatalhao = function () {
    const n = window.val("novo-batalhao-nome");
    if (!n) return window.sigoNotify("ERRO", "Digite o nome.", "erro");
    const b = JSON.parse(localStorage.getItem("sigo_db_batalhoes")) || [];
    b.push(n);
    localStorage.setItem("sigo_db_batalhoes", JSON.stringify(b));
    window.setVal("novo-batalhao-nome", "");
    window.renderizarBatalhoes();
    window.atualizarDashboard();
    window.sigoNotify("SUCESSO", "Batalhão adicionado.", "sucesso");
};
window.renderizarBatalhoes = function () {
    if (!window.$("lista-batalhoes")) return;
    let hc = "";
    (JSON.parse(localStorage.getItem("sigo_db_batalhoes")) || []).forEach((x, i) => {
        hc += `<div class="caixa-batalhao"><span style="font-weight:600; font-size:11px; color:#e2e8f0;">${x}</span><button class="btn-remover-oficial" onclick="removerBatalhao(${i})">[ REMOVER ]</button></div>`;
    });
    window.html("lista-batalhoes", hc);
};
window.removerBatalhao = async function (i) {
    const c = await window.sigoConfirm("Apagar batalhão?");
    if (!c) return;
    const b = JSON.parse(localStorage.getItem("sigo_db_batalhoes")) || [];
    b.splice(i, 1);
    localStorage.setItem("sigo_db_batalhoes", JSON.stringify(b));
    window.renderizarBatalhoes();
    window.atualizarDashboard();
};

window.renderizarAuditoria = function () {
    if (!window.$("lista-auditoria")) return;
    const tx = window.val("busca-auditoria").toLowerCase();
    const dm = JSON.parse(localStorage.getItem("sigo_db_usuarios"));
    let tb = [];
    Object.keys(dm).forEach((p) => {
        tb = tb.concat(JSON.parse(localStorage.getItem("sigo_historico_" + p)) || []);
    });
    let hc = "";
    tb.reverse()
        .filter((b) => b.protocolo.toLowerCase().includes(tx) || b.oficialPass.includes(tx))
        .forEach((b) => {
            let ia = b.status === "ARQUIVADO";
            let c = ia ? "#475569" : b.tipo === "RUF" ? "var(--bombeiro-dark)" : "var(--pm-blue)";
            let ba = ia ? `<span style="color:#ef4444; font-size:10px; margin-left:10px;">[ ARQUIVADO ]</span>` : "";
            hc += `<div class="card-boletim" style="border-left-color:${c}; opacity: ${ia ? "0.6" : "1"}; text-decoration: ${ia ? "line-through" : "none"};" onclick="abrirBoletimPainel('${b.protocolo}','${b.oficialPass}')"><div class="card-topo"><span class="card-titulo">[ ${b.tipo} ] ${b.protocolo} ${ba}</span></div><p class="card-detalhe" style="text-decoration: none;">Agente: ${b.oficialNome}</p></div>`;
        });
    window.html("lista-auditoria", hc);
};
window.renderizarSolicitacoes = function () {
    if (!window.$("lista-solicitacoes")) return;
    let hc = "";
    (JSON.parse(localStorage.getItem("sigo_solicitacoes")) || []).reverse().forEach((s, i) => {
        hc += `<div class="card-solicitacao"><div class="card-solicitacao-header"><span class="solicitacao-tipo">[ ${s.tipo} ] - ${s.protocolo}</span></div><p style="font-size:10px; color:#cbd5e1; margin-bottom:8px;">DE: ${s.oficial}</p><div style="background:#05070a; padding:15px; border-radius:4px; font-size:11px; color:#94a3b8; margin-bottom:15px;">"${s.motivo}"</div><div style="display:flex; gap:10px;"><button class="btn-neutro" style="background:var(--success-green); color:#000;" onclick="aprovarSolicitacao(${i})">[ AUTORIZAR ]</button><button class="btn-perigo" onclick="negarSolicitacao(${i})">[ NEGAR ]</button></div></div>`;
    });
    window.html("lista-solicitacoes", hc);
};

window.aprovarSolicitacao = async function (i) {
    const sl = JSON.parse(localStorage.getItem("sigo_solicitacoes")) || [];
    const s = sl[i];
    if (s.tipo === "EXCLUSAO" || s.tipo === "ARQUIVAMENTO") {
        let historico = JSON.parse(localStorage.getItem("sigo_historico_" + s.oficialPass)) || [];
        const novoHistorico = historico.filter((b) => b.protocolo !== s.protocolo);
        if (historico.length !== novoHistorico.length) {
            localStorage.setItem("sigo_historico_" + s.oficialPass, JSON.stringify(novoHistorico));
            window.sigoNotify("DEFERIDO", "Documento excluído da base central com sucesso.", "sucesso");
            window.registrarLogInterno(
                "ADMIN",
                "Comando",
                s.oficialPass,
                `Excluiu B.O/RUF ${s.protocolo}`,
                "AUDITORIA"
            );
        } else {
            window.sigoNotify("ERRO", "Documento não encontrado.", "erro");
        }
    } else {
        window.sigoNotify("DEFERIDO", "Solicitação autorizada.", "sucesso");
    }
    sl.splice(i, 1);
    localStorage.setItem("sigo_solicitacoes", JSON.stringify(sl));
    window.renderizarSolicitacoes();
    window.renderizarAuditoria();
    if (typeof window.carregarMeusBoletinsPainel === "function") window.carregarMeusBoletinsPainel();
};
window.negarSolicitacao = function (i) {
    const sl = JSON.parse(localStorage.getItem("sigo_solicitacoes")) || [];
    sl.splice(i, 1);
    localStorage.setItem("sigo_solicitacoes", JSON.stringify(sl));
    window.sigoNotify("INDEFERIDO", "Negado.", "aviso");
    window.renderizarSolicitacoes();
};
window.setFiltroLog = function (t, b) {
    filtroLogAtual = t;
    b.parentElement.querySelectorAll(".btn-filtro").forEach((x) => x.classList.remove("ativo"));
    b.classList.add("ativo");
    window.renderizarLogsAdmin();
};
window.renderizarLogsAdmin = function () {
    if (!window.$("lista-logs-sistema")) return;
    const tx = window.val("busca-logs-admin").toLowerCase();
    let hc = "";
    (JSON.parse(localStorage.getItem("sigo_db_logs")) || [])
        .reverse()
        .filter((l) => {
            return (
                (filtroLogAtual === "TODOS" || l.modulo === filtroLogAtual || l.categoria === filtroLogAtual) &&
                (l.autor.toLowerCase().includes(tx) ||
                    l.passaporte.includes(tx) ||
                    l.detalhes.toLowerCase().includes(tx))
            );
        })
        .forEach((l) => {
            hc += `<div class="log-card log-cat-${l.categoria} step-animado"><div><span style="font-size:9px; color:#64748b;">[ ${l.data} ] MÓDULO: ${l.modulo}</span><p style="font-size:12px; color:#f8fafc; font-weight:800; margin-top:5px;">${l.detalhes}</p></div><span style="font-size:8px; background:#1e293b; padding:4px 8px; border-radius:2px; color:#cbd5e1;">${l.id}</span></div>`;
        });
    window.html("lista-logs-sistema", hc);
};

window.renderizarInterruptores = function () {
    if (!window.$("lista-interruptores")) return;
    const m = JSON.parse(localStorage.getItem("sigo_modulos")) || DEFAULT_MODULES;
    let hc = "";
    Object.keys(m).forEach((k) => {
        let ia = m[k];
        let c = ia ? "var(--success-green)" : "#475569";
        let ts = ia ? "ONLINE" : "OFFLINE";
        hc += `<div style="background:#080b12;border-left:3px solid ${c};padding:15px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;"><div><span style="color:#f8fafc;font-size:12px;font-weight:800;text-transform:uppercase;">MÓDULO: ${k}</span><br><span style="font-size:10px;color:${c};">[ ${ts} ]</span></div><button class="btn-neutro font-mono" style="padding:8px 15px;font-size:10px;" onclick="toggleModulo('${k}')">[ ALTERAR ]</button></div>`;
    });
    window.html("lista-interruptores", hc);
};
window.toggleModulo = async function (m) {
    const ms = JSON.parse(localStorage.getItem("sigo_modulos")) || DEFAULT_MODULES;
    ms[m] = !ms[m];
    localStorage.setItem("sigo_modulos", JSON.stringify(ms));
    window.aplicarTravaModulos();
    window.renderizarInterruptores();
    window.sigoNotify("SISTEMA", `Módulo ${m} ${ms[m] ? "ativado" : "desativado"}.`, "aviso");
};
window.salvarConfiguracoes = function () {
    const s = window.val("config-sigla"),
        n = window.val("config-nome"),
        b = window.val("config-brasao");
    if (!s || !n) return window.sigoNotify("ERRO", "Preencha.", "erro");
    const c = { sigla: s, nome: n, brasao: b || DEFAULT_CONFIG.brasao };
    localStorage.setItem("sigo_global_ui", JSON.stringify(c));
    window.carregarConfiguracoesGlobais();
    window.sigoNotify("SALVO", "Atualizado.", "sucesso");
};
window.abrirModalTesteWebhook = function () {
    window.shw("modal-teste-webhook");
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        [
            "modal-boletim",
            "modal-cad-usuario",
            "modal-perfil-usuario",
            "modal-documento-licenca",
            "modal-teste-webhook",
        ].forEach(window.hid);
    }
    if (e.key === "Enter") {
        if (e.target.tagName === "TEXTAREA" || e.target.id === "prompt-input") return;
        if (
            !window.$("step-identificacao")?.classList.contains("hidden") &&
            document.activeElement.id === "input-cpf"
        ) {
            window.iniciarBusca();
        } else if (!window.$("step-pin-militar")?.classList.contains("hidden")) {
            window.validarPin();
        } else if (!window.$("step-pin-civil")?.classList.contains("hidden")) {
            window.validarPinCivil();
        }
    }
});

window.salvarModulos = function() {
    window.aplicarTravaModulos();
    window.sigoNotify("SISTEMA", "Diretrizes de Módulos sincronizadas e salvas.", "sucesso");
    const u = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if(u) window.registrarLogInterno("ADMIN", u.nome, u.passaporte, "Sincronizou os Módulos Globais", "CONFIG");
};



setInterval(() => {
    if (!localStorage.getItem("sigo_db_usuarios")) {
        console.warn("[WATCHDOG] Restaurando DB...");
        window.inicializarBanco();
    }
    const l = JSON.parse(sessionStorage.getItem("sigo_oficial_logado"));
    if (l && l.tipo !== "CIVIL") {
        const db = JSON.parse(localStorage.getItem("sigo_db_usuarios"));
        if (!db || !db[l.passaporte] || db[l.passaporte].status === "SUSPENSO") {
            sessionStorage.removeItem("sigo_oficial_logado");
            window.location.href = "index.html";
        } else {
            db[l.passaporte].online = true;
            localStorage.setItem("sigo_db_usuarios", JSON.stringify(db));
        }
    }
}, 10000);
/* FIM S.I.G.O BETA COMPLETO */



