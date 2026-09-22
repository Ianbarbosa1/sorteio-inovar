/*ABERTURA E FECHADURA DO MENU LATERAL*/
let cml = document.querySelector('#cml')
function abrirMenuLateral() {
    cml.style.display = 'flex'
}
function fecharMenuLateral() {
    cml.style.display = 'none'
}


/*FECHA O FORMULÁRIO DE RESERVA DO NÚMERO DO CLIENTE*/
function FecharFormulario() {
    let formulario = document.querySelector('.formulario');
    formulario.style.display = 'none';
}

/*FECHAR O FORMULÁRIO DE EDIÇÃO DOS DADOS DO CLIENTE*/
function fecharEditor(){
    let containerEditor = document.querySelector('#editor')
    containerEditor.style.display = 'none'
}