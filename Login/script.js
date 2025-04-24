window.onload = sessionStorage.setItem('loggedIn', 'false');/* Faz o valor de "logado" ser "falso" */ 

function login() { /* Define a função de login */
    const usuario = document.getElementById('user').value; /* Recebe o valor do campo "usuario" */
    const senha = document.getElementById('pass').value;    /* Recebe o valor do campo "senha" */

    /*  Define o usuário e senha fictícios */
    const userValido = 'admin';
    const senhaValida = '12345';
    
    

    if (usuario === userValido && senha === senhaValida) { /* Verifica se o usuário e senha são iguais aos definidos*/
        alert("logado com sucesso!"); 
        sessionStorage.setItem('loggedIn', 'true');
        window.location.href = '/Registros/index.html';/* Se sim, envia para a página de registros */
    } else {
        alert("Senha ou usuários incorretos!") /* Se não, envia um alerta */
    }
        
}function teste() {
    if (localStorage.getItem('loggedIn') !== "true"){
        alert("Você precisa estar logado!")
    }else(
        window.location.href("/Registros/index.html")
    )
}


