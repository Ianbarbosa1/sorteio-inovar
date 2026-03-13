import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue, remove,update } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyCtk0iopRxmAr89DLn6gHBnqnVtKDBIM-k",
    authDomain: "sorteio-inovar.firebaseapp.com",
    databaseURL: "https://sorteio-inovar-default-rtdb.firebaseio.com",
    projectId: "sorteio-inovar",
    storageBucket: "sorteio-inovar.firebasestorage.app",
    messagingSenderId: "1023153056854",
    appId: "1:1023153056854:web:13f285abe2d00e87ad9ff7",
    measurementId: "G-C9KSKFGCHC"
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
let todosClientes = [];


/*AVISOS (ATIVAÇÃO E DESATIVAÇÃO)*/
let divAviso = document.querySelector('#aviso')
function aviso(texto, cor){
    divAviso.style.zIndex = '+99'
    divAviso.style.opacity = '1'
    divAviso.style.transform ='translateY(-50px)';
    divAviso.innerHTML = texto;
    if(cor == 1){
        divAviso.style.background = '#67ca4b'
    }
    else{
        divAviso.style.background = '#ff2023'
    }
}
function offAviso(){
    setTimeout(() => {
        divAviso.style.zIndex = '-99'
        divAviso.style.opacity = '0'
        divAviso.style.transform ='translateY(0px)';
    }, 6000);
}


/*FUNÇÃO QUE CARREGA OS NÚMEROS NA TELA*/
const numerosContainer = document.getElementById("numeros");
function carregarNumeros() {
    numerosContainer.innerHTML = "";
    for (let i = 1; i <= 300; i++) {
        const div = document.createElement("div");
        div.classList.add("num");
        div.innerText = i;
        div.id = `num_${i}`;
        div.onclick = () => reservarNumero(i);
        numerosContainer.appendChild(div);
    }
}


/*SELECIONA O NÚMERO ESCOLHIDO PELO USUÁRIO*/
let numeroEscolhido = null;
let numeroCliente = document.querySelector("#numeroEscolhido")
let formulario = document.querySelector('#formulario');
function reservarNumero(n) {
    const el = document.getElementById(`num_${n}`);
    if (el.classList.contains("ocupado")) {
        aviso("Este número já foi reservado!", 1);
        offAviso();
        return;
    }

    numeroEscolhido = n;
    numeroCliente.innerHTML = n;
    formulario.style.display = 'flex';
}


/*CADASTRO DOS DADOS DO CLIENTE NO BANCO*/
let reserva = document.querySelector('#reserva');
reserva.addEventListener('click', SalvarDados)
export async function SalvarDados(e) {
    e.preventDefault();

    const nome = document.querySelector('#nome').value.trim();
    const numeroCliente = document.querySelector('#numero').value.trim();

    if (!nome || !numeroCliente) {
        aviso("Preencha todos os campos!", 0);
        offAviso();
        return;
    }
    else if (nome.length < 5) {
        aviso("Insira o nome completo do cliente!", 0);
        offAviso();
        return;
    }
    else if (numeroCliente.length !== 11) {
        aviso("Insira um número de telefone válido!", 0);
        offAviso();
        return;
    }
    const caminho = ref(db, "sorteio/" + numeroEscolhido);

    try {
        const snapshot = await get(caminho);
        if (snapshot.exists()) {
            aviso("Este número já foi escolhido por outra pessoa!", 0);
            offAviso();
            botao.disabled = false;
            return;
        }
        await set(caminho, {
            nome: nome,
            numeroCliente: numeroCliente
        });
        aviso("Número cadastrado com sucesso!", 1);
        offAviso();
        document.querySelector('.formulario').style.display = "none";

        const el = document.getElementById(`num_${numeroEscolhido}`);
        if (el) {
            el.classList.add("ocupado");
        }

        document.querySelector('#nome').value = '';
        document.querySelector('#numero').value = '';

    } catch (err) {
        console.error(err);
        aviso("Erro ao reservar número escolhido", 0);
        offAviso();
    }

    function EnviarWhats() {
        let url = 'http://wa.me/55' + numeroCliente + '?text='
            + '*FIM DE ANO PREMIADO BAZAR INOVAR*' + '%0a'
            + 'Parabéns! Você está participando do sorteio do Bazar Inovar' + '%0a'
            + 'O sorteio será realizado no dia 30/12/2025.' + '%0a'
            + 'Consulte o link para saber mais informações sobre o sorteio!' + '%0a'
            + 'Site Inovar: https://bazar-inovar.github.io/Fim-de-Ano-Premiado/' + '%0a'
        window.open(url, '_blank').focus()
    }

    EnviarWhats()
}


/*CARREGA A TABELA EM TEMPO REAL PARA FICAR SEMPRE VISIVEL*/
export function carregarTabela() {
    const tabela = document.getElementById("tabelaEscolhas");
    const refDB = ref(db, "sorteio");

    onValue(refDB, (snapshot) => {

        tabela.innerHTML = "";
        todosClientes = [];
        const dados = snapshot.val();
        if (!dados) return;

        const numerosOrdenados = Object.keys(dados).sort((a, b) => a - b);

        numerosOrdenados.forEach(num => {
            const cliente = {
                numero: num,
                nome: dados[num].nome,
                telefone: dados[num].numeroCliente
            };
            todosClientes.push(cliente);
            tabela.innerHTML += `
                <tr>
                    <td>${cliente.numero}</td>
                    <td>${cliente.nome}</td>
                    <td>${cliente.telefone}</td>
                    <td class="alteracao"> 
                        <img src="./assents/imagens/editar.svg" title="editar" onclick="abrirEditor(${cliente.numero})"> 
                        <img src="./assents/imagens/deletar.svg" title="deletar" onclick="excluirCliente(${cliente.numero})">
                    </td>
                </tr>`;
        });
    });
}


/*ATUALIZA O ESTADO DO NÚMERO QUE O CLIENTE ESCOLHEU (ocupado)*/
export function atualizarEstado() {
    const refDB = ref(db, "sorteio");
    onValue(refDB, (snapshot) => {
        const dados = snapshot.val();
        document.querySelectorAll('.num').forEach(n => n.classList.remove('ocupado'));

        if (dados) {
            Object.keys(dados).forEach(num => {
                const el = document.getElementById(`num_${num}`);
                if (el) el.classList.add('ocupado');
            });
        }
    });
}


/*FUNÇÕES DE PESQUISA DE CLIENTES JÁ CADASTRADOS*/
let variavel = document.querySelector('#aba-pesquisa');
variavel.addEventListener("input", () => {
    const valor = variavel.value.trim();

    if (valor === "") {
        mostrarResultados(todosClientes);
        return;
    }
    const resultados = pesquisarClientes(valor);
    mostrarResultados(resultados);

});
function pesquisarClientes(valor) {
    const busca = valor.toLowerCase();
    return todosClientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(busca) ||
        cliente.telefone.includes(busca) ||
        cliente.numero.includes(busca)
    );
}
function mostrarResultados(resultados) {
    const tabela = document.getElementById("tabelaEscolhas");
    tabela.innerHTML = "";
    resultados.forEach(cliente => {

        tabela.innerHTML += `
                <tr>
                    <td>${cliente.numero}</td>
                    <td>${cliente.nome}</td>
                    <td>${cliente.telefone}</td>
                    <td class="alteracao"> 
                        <img src="./assents/imagens/editar.svg" alt="editar" title="editar"> 
                        <img src="./assents/imagens/deletar.svg" title="deletar" onclick="excluirCliente(${cliente.numero})">
                    </td>
                </tr>`;
    });
}


/*ALTERAÇÃO DO BANCO*/
let containerEditor = document.querySelector('#editor')
let clienteEditado = null 
window.abrirEditor = function(id){
    containerEditor.style.display = 'flex'
    clienteEditado = id
}


/*FECHAR O FORMULÁRIO DE EDIÇÃO DOS DADOS DO CLIENTE*/
function fecharEditor(){
    let containerEditor = document.querySelector('#editor')
    containerEditor.style.display = 'none'
}
let botaoEditor = document.querySelector('#edicao')
botaoEditor.addEventListener('click', fazerEdicao)
function fazerEdicao(){
    let id = clienteEditado;
    console.log(id)
    let novoNome = document.querySelector('#novoNome').value.trim();
    let novoNumero = document.querySelector('#novoNumero').value.trim();
    
    if(novoNome.length >= 4 &&  novoNumero.length == 11){
        aviso("Os dados foram alterados!", 1);
        offAviso();
        update(ref(db, "sorteio/" + id ), {
            nome: novoNome,
            numeroCliente: novoNumero
        })
        fecharEditor()
    }
    else if(novoNome === '' & novoNumero.length == 11){
        aviso("Número de telefone alterado com sucesso!", 1);
        offAviso();
        update(ref(db, "sorteio/" + id ), {
            numeroCliente: novoNumero
        })
        fecharEditor()
    }
    else if(novoNome.length >= 4 & novoNumero === ''){
        aviso("Nome alterado com sucesso!", 1);
        offAviso();
        
        update(ref(db, "sorteio/" + id ), {
            nome: novoNome
        })
        fecharEditor()
    }
    else{
        aviso("Verifique se os dados foram inseridos corretamente, pois ainda há divergencias nos dados inseridos!", 0);
        offAviso();
    }
}


/*EXCLUSÃO DO CLIENTE*/
window.excluirCliente = function (id) {
    let cliente = ref(db, "sorteio/" + id);
    let senha = prompt("Digite a senha para executar a exclusão:")
    if (senha == 29042023) {
        remove(cliente)
        aviso("O cliente foi removido com sucesso!!!", 1);
        offAviso();
    }
    else {
        aviso("Senha incorreta", 0);
        offAviso();
    }
}


/*LIMPAR O BANCO*/
document.getElementById("btnLimpar").onclick = () => {
    const senha = prompt("Digite a senha admin:");
    if (senha == 29042023) {
        remove(ref(db, "sorteio"));
        aviso("Todos os dados do banco foram deletados!!!", 1);
        offAviso();
    }
    else{
        aviso("Digite a senha correta!", 0);
        offAviso();
    }
};


atualizarEstado()
carregarTabela()
carregarNumeros()