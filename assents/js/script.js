import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

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
const db = getDatabase(app);
const numerosContainer = document.getElementById("numeros");

function carregarNumeros() {
    numerosContainer.innerHTML = "";
    for (let i = 1; i <= 200; i++) {
        const div = document.createElement("div");
        div.classList.add("num");
        div.innerText = i;
        div.id = `num_${i}`;
        div.onclick = () => reservarNumero(i);
        numerosContainer.appendChild(div);
    }
}

function atualizarEstado() {
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

let numeroEscolhido = null;
let formulario = document.querySelector('.formulario');

function reservarNumero(n) {
    const el = document.getElementById(`num_${n}`);
    if (el.classList.contains("ocupado")) {
        alert("Número já escolhido!");
        return;
    }

    numeroEscolhido = n; 

    formulario.style.display = 'flex';
}

let botao = document.querySelector('#botao');
botao.addEventListener('click', SalvarDados)

async function SalvarDados(e) {
    e.preventDefault(); // impede recarregar a página

    const nome = document.querySelector('#nome').value.trim();
    const numeroCliente = document.querySelector('#numero').value.trim();

    if (!nome || !numeroCliente) {
        alert("Preencha todos os campos!");
        return;
    }
    else if (nome.length < 3){
        alert("Insira o nome completo!");
        return;
    }
    else if (numeroCliente.length !== 11  ){
        alert("Insira um número de cliente válido!");
        return;
    }

    // Evita múltiplos cliques
    botao.disabled = true;

    const caminho = ref(db, "sorteio/" + numeroEscolhido);

    try {
        // Verifica se o número já foi reservado por outra pessoa nesse meio tempo
        const snapshot = await get(caminho);

        if (snapshot.exists()) {
            alert(`O número ${numeroEscolhido} já foi escolhido por outra pessoa!`);
            botao.disabled = false;
            return;
        }

        // Envia para o Firebase
        await set(caminho, {
            nome: nome,
            numeroCliente: numeroCliente
        });

        alert(`Número ${numeroEscolhido} reservado com sucesso!`);

        // Fecha o formulário
        document.querySelector('.formulario').style.display = "none";

        // Marca o número como ocupado na interface
        const el = document.getElementById(`num_${numeroEscolhido}`);
        if (el) {
            el.classList.add("ocupado");
        }

        // Limpa campos
        document.querySelector('#nome').value = '';
        document.querySelector('#numero').value = '';

    } catch (err) {
        console.error(err);
        alert("Erro ao reservar!");
    }

    botao.disabled = false;
}

function carregarTabela() {
    const tabela = document.getElementById("tabelaEscolhas");
    const refDB = ref(db, "sorteio");

    onValue(refDB, (snapshot) => {
        tabela.innerHTML = "";

        const dados = snapshot.val();
        if (!dados) return;

        // Ordenar do menor para o maior (ordem crescente)
        const numerosOrdenados = Object.keys(dados).sort((a, b) => a - b);

        numerosOrdenados.forEach(num => {
            const nome = dados[num].nome;
            const numeroCliente = dados[num].numeroCliente; // <-- ADICIONADO

            tabela.innerHTML += `
                <tr>
                    <td>${num}</td>
                    <td>${nome}</td>
                    <td>${numeroCliente}</td>
                </tr>
            `;
        });
    });
}

document.getElementById("btnLimpar").onclick = () => {
    const senha = prompt("Digite a senha admin:");
    if (senha !== "hallo") return alert("Senha incorreta!");
    remove(ref(db, "sorteio"));
    alert("Todos os números foram liberados!");
};


let menuSuspenso = document.querySelector('.menu-suspenso');
let tabelaClientes = document.querySelector('.tabela-clientes');

let AberturaMenu = document.querySelector('.menu-hamburguer');
let abrirTabela = document.querySelector('.tabela');
let fechar = document.querySelector('.fechar');
let fecharT = document.querySelector('.fecharT');
let fecharForm = document.querySelector('.fechar-form');

abrirTabela.addEventListener('click', AbrirClientes)
AberturaMenu.addEventListener('click', Abrir)
fechar.addEventListener('click', Fechar)
fecharT.addEventListener('click', FecharC)
fecharForm.addEventListener('click', FecharFormulario)

function Abrir(){
    menuSuspenso.style.display = 'flex';
}
function Fechar(){
    menuSuspenso.style.display = 'none';
}
function AbrirClientes(){
    tabelaClientes.style.display = 'flex';
}

function FecharC(){
    tabelaClientes.style.display = 'none';
}

function FecharFormulario(){
    formulario.style.display = 'none';
}

carregarNumeros();
atualizarEstado();
carregarTabela(); 