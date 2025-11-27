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

function reservarNumero(n) {
    const el = document.getElementById(`num_${n}`);
    if (el.classList.contains("ocupado")) {
        alert("Número já escolhido!");
        return;
    }

    const nome = prompt("Digite seu nome para reservar o número:");
    if (!nome) return;

    const numeroCliente = prompt("Digite o número de telefone do cliente:");
    if (!numeroCliente) return;

    set(ref(db, `sorteio/${n}`), { 
        nome,
        numeroCliente
    });

    alert(`Número ${n} reservado com sucesso!`);
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

            tabela.innerHTML += `
                <tr>
                    <td>${nome}</td>
                    <td>${num}</td>
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

abrirTabela.addEventListener('click', AbrirClientes)
AberturaMenu.addEventListener('click', Abrir)
fechar.addEventListener('click', Fechar)
fecharT.addEventListener('click', FecharC)

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

carregarNumeros();
atualizarEstado();
carregarTabela(); 