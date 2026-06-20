async function realizarLogin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('mensagem-erro');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const dados = await response.json();

        if (response.ok) {
            // Guarda o token ou a confirmação no navegador (vamos usar localStorage de forma simples)
            localStorage.setItem('usuarioLogado', 'true');
            // Redireciona para o painel
            window.location.href = '/admin.html';
        } else {
            msgErro.innerText = dados.error || "Usuário ou senha incorretos";
            msgErro.style.display = 'block';
        }
    } catch (erro) {
        console.error("Erro ao fazer login:", erro);
        msgErro.innerText = "Erro ao conectar com o servidor.";
        msgErro.style.display = 'block';
    }
}