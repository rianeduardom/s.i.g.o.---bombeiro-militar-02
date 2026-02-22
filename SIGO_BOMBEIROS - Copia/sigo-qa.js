/* =====================================================================
   S.I.G.O. QA AUTOMATION - BOT AUDITOR DE TESTES (E2E)
===================================================================== */

window.addEventListener('load', () => {
    // Aguarda 2.5 segundos para garantir que o S.I.G.O. carregou tudo
    setTimeout(iniciarAuditoriaAutomatica, 2500);
});

async function iniciarAuditoriaAutomatica() {
    const webhookQA = "https://discord.com/api/webhooks/1474922821972131912/OMbYJj5O67FdL2ebAdBoc_7EM5YsIrkYwJXgbYxSjmiWOYS0SHpocnOx0vNO-Q_Mx2Ir";

    // 1. Cria a tela preta de Auditoria Visual
    const overlay = document.createElement("div");
    overlay.id = "qa-overlay";
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(8, 11, 18, 0.95); z-index:9999999; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#38bdf8; font-family:'JetBrains Mono', monospace;";
    overlay.innerHTML = `
        <h1 style="color:#facc15; font-size:24px; margin-bottom:10px;">[ MODO DESENVOLVEDOR ]</h1>
        <h2 style="color:#fff; font-size:18px; margin-bottom:30px;">ROBÔ DE AUDITORIA QA EM EXECUÇÃO...</h2>
        <div id="qa-console" style="background:#000; border:1px solid #38bdf8; width:500px; height:200px; padding:15px; overflow-y:auto; color:#4ade80; font-size:12px; text-align:left;">
            > Iniciando varredura no S.I.G.O...<br>
        </div>
    `;
    document.body.appendChild(overlay);

    const logConsole = document.getElementById("qa-console");
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let relatorio = [];
    let erros = 0;

    function registrar(nome, status, detalhe) {
        if (status === "FALHA") erros++;
        relatorio.push({
            name: `🔍 ${nome}`,
            value: `**Status:** ${status === "OK" ? "✅ PASSOU" : "❌ FALHOU"}\n**Log:** ${detalhe}`,
            inline: false
        });
        logConsole.innerHTML += `> TESTE: ${nome} | [${status}]<br>`;
        logConsole.scrollTop = logConsole.scrollHeight; // Rola para baixo
    }

    try {
        // ==========================================
        // BATERIA DE TESTES
        // ==========================================

        await sleep(1000);
        // TESTE 1: Banco de Dados
        if (localStorage.getItem("sigo_db_usuarios")) {
            registrar("Integridade do Banco de Dados", "OK", "Bancos locais criados com sucesso.");
        } else {
            registrar("Integridade do Banco de Dados", "FALHA", "Banco de dados não foi inicializado.");
        }

        await sleep(1000);
        // TESTE 2: Limite do ID
        logConsole.innerHTML += `> Injetando ID inválido (99999)...<br>`;
        if (document.getElementById("input-cpf")) {
            document.getElementById("input-cpf").value = "99999";
            window.iniciarBusca();
            await sleep(1000);
            let toast = document.querySelector('.sigo-toast.erro');
            if (toast && toast.innerText.includes("inválido")) {
                registrar("Trava de Segurança (Limite ID)", "OK", "Bloqueou ID maior que 4 dígitos.");
            } else {
                registrar("Trava de Segurança (Limite ID)", "FALHA", "Falhou ao bloquear ID anormal.");
            }
        }

        await sleep(1500);
        // TESTE 3: Roteamento de Civil Novo
        logConsole.innerHTML += `> Forçando criação de ID Fantasma (8888)...<br>`;
        document.getElementById("input-cpf").value = "8888";
        window.iniciarBusca();
        await sleep(1000);
        if (!document.getElementById("step-cadastro-civil").classList.contains("hidden")) {
            registrar("Roteamento Inteligente (Civil)", "OK", "Abriu painel de cadastro corretamente.");
            window.voltarInicio(); // Limpa a tela
        } else {
            registrar("Roteamento Inteligente (Civil)", "FALHA", "Não redirecionou para tela de cadastro.");
            window.voltarInicio();
        }

        await sleep(1500);
        // TESTE 4: Tentativa de Invasão Admin
        logConsole.innerHTML += `> Injetando ID Comando (3447) com senha falsa...<br>`;
        document.getElementById("input-cpf").value = "3447";
        window.iniciarBusca();
        await sleep(1000);
        document.getElementById("input-pin").value = "0000"; // Senha errada
        window.validarPin();
        await sleep(1000);
        if (!sessionStorage.getItem("sigo_oficial_logado")) {
            registrar("Criptografia e Acesso Tático", "OK", "Barrou login do Comando com senha incorreta.");
        } else {
            registrar("Criptografia e Acesso Tático", "FALHA", "PERMITIU INVASÃO NO COMANDO.");
        }

        await sleep(1000);
        window.voltarInicio();

    } catch (e) {
        registrar("Falha Crítica do Script QA", "FALHA", `Erro na execução do robô: ${e.message}`);
    }

    // ==========================================
    // DISPARO DO LAUDO VIA WEBHOOK
    // ==========================================
    logConsole.innerHTML += `<br>> Compilando relatório e transmitindo para a Webhook...<br>`;
    await sleep(1500);

    const corEmbed = erros === 0 ? 3066993 : 15158332; // Verde (Passou) / Vermelho (Falhou)
    const tituloStatus = erros === 0 ? "🟢 SISTEMA HOMOLOGADO E ESTÁVEL" : `🔴 BETA RECUSADO: ${erros} VULNERABILIDADES`;

    const payload = {
        username: "S.I.G.O. | QA Bot Auditor",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/2069/2069818.png",
        content: erros > 0 ? "@everyone Atenção Comando, falhas detectadas no sistema!" : "",
        embeds: [{
            title: "🧪 LAUDO DE PENTEST E INTEGRIDADE E2E",
            description: `A inteligência artificial executou uma bateria de testes forçando inputs, rotas e travas de segurança do S.I.G.O.\n\n**DIAGNÓSTICO FINAL:**\n**${tituloStatus}**`,
            color: corEmbed,
            fields: relatorio,
            footer: { text: "Auditoria Interna Governamental" },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(webhookQA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        logConsole.innerHTML += `> TRANSMISSÃO CONCLUÍDA COM SUCESSO!<br>`;
    } catch (error) {
        logConsole.innerHTML += `> ERRO AO ENVIAR PARA O DISCORD.<br>`;
    }

    // Fecha a tela preta depois de 3 segundos
    await sleep(3000);
    document.body.removeChild(overlay);
    window.sigoNotify("QA FINALIZADO", "Relatório de testes enviado ao Discord.", "sucesso");
}