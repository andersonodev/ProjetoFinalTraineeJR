sessionStorage.setItem('loggedIn', 'false');    /* Faz o valor de "logado" ser "falso" */

function login() { /* Define a função de login */
    const usuario = document.getElementById('user').value; /* Recebe o valor do campo "usuario" */
    const senha = document.getElementById('pass').value;    /* Recebe o valor do campo "senha" */

    /*  Define o usuário e senha fictícios */
    const userValido = 'admin';
    const senhaValida = '12345';
    

    if (usuario === userValido && senha === senhaValida) { /* Verifica se o usuário e senha são iguais aos definidos*/
        alert("logado com sucesso!"); 
        console.log('loggedIn')
        window.location.href = '/Resultados/index.html';/* Se sim, envia para a página de registros */
        return sessionStorage.setItem('loggedIn', 'true'); /* "logado" recebe o valor "positivo" */
        
    } else {
        alert("Senha ou usuários incorretos!") /* Se não, envia um alerta */
    }
        
}

function teste(){
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'true'){
        alert("Você precisa estar logado!")
    }
    else{
        window.location.href = '/Resultados/index.html';
    }
}