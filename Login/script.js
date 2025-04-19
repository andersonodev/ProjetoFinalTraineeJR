sessionStorage.setItem('loggedIn', 'false');    /* Faz o valor de "logado" ser "falso" */
function login() { /* Define a função de login */
    const usuario = document.getElementById('user').value; /* Recebe o valor do campo "usuario" */
    const senha = document.getElementById('pass').value;    /* Recebe o valor do campo "senha" */

    /*  Define o usuário e senha fictícios */
    const userValido = 'admin';
    const senhaValida = '12345';
    

    if (usuario === userValido && senha === senhaValida) { /* Verifica se o usuário e senha são iguais aos definidos*/
        window.location.href = '/Registros/index.html';/* Se sim, envia para a página de registros */
        alert("logado com sucesso!"); 
        return sessionStorage.setItem('loggedIn', 'true'); /* "logado" recebe o valor "positivo" */
        
    } else {
        alert("Senha ou usuários incorretos!") 
    }
    

    
}
window.onload = function() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'true') {
        
        window.location.href = '/Login/index.html'; // Se não estiver logado, redireciona para a página de login
    }
}
function teste(){
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'true'){
        alert("Você precisa estar logado!")
    }
    else{
        window.location.href = '/Registros/index.html';
    }
}