/**
 * Aplicações multimédia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 *
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.

// sons do jogo
const sounds = {
  background: "",
  flip: "",
  success: "",
  hide: "",
};

// numero de linhas e colunas do tabuleiro;
const ROWS = 4;
const COLS = 4;

game.sounds = sounds; // Adicionar os sons sons do jogo ao objeto game.
game.board = Array(COLS)
  .fill()
  .map(() => Array(ROWS)); // criação do tabuleiro como um array de 6 linhas x 8 colunas

// Representa a imagem de uma carta de um país. Esta definição é apenas um modelo para outros objectos que sejam criados
// com esta base através de let umaFace = Object.create(face).
const face = {
  country: -1,
  x: -1,
  y: -1,
};

const CARDSIZE = 102; // tamanho da carta (altura e largura)
let faces = []; // Array que armazena objectos face que contêm posicionamentos da imagem e códigos dos paises

window.addEventListener("load", init, false);

function init() {
  game.stage = document.querySelector("#stage");
  setupAudio(); // configurar o audio
  getFaces(); // calcular as faces e guardar no array faces
  createCountries(); // criar países
  game.sounds.background.play();

  //completar
}

// Cria os paises e coloca-os no tabuleiro de jogo(array board[][])
function createCountries() {
  let cardIndex = 0;
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      let umaCarta = document.createElement("div");
      umaCarta.classList.add("carta");

      // Posição da carta com base nas coordenadas das faces
      umaCarta.style.backgroundPositionX = faces[cardIndex].x;
      umaCarta.style.backgroundPositionY = faces[cardIndex].y;
      umaCarta.dataset.country = faces[cardIndex].country; // Atribui o país à carta
      umaCarta.classList.add("escondida"); // Carta começa escondida

      // Define tamanho e posição das cartas
      umaCarta.style.width = `${CARDSIZE}px`;
      umaCarta.style.height = `${CARDSIZE}px`;
      umaCarta.style.top = `${i * CARDSIZE}px`;
      umaCarta.style.left = `${j * CARDSIZE}px`;

      // Adiciona as cartas ao tabuleiro
      game.stage.appendChild(umaCarta);

      // Aumenta o índice da próxima face
      cardIndex++;

      // Adiciona o evento de clique para virar as cartas
      umaCarta.addEventListener("click", () => flipCard(umaCarta));
    }
  }
  scramble(); // Baralha as cartas
}

// Adicionar as cartas do tabuleiro à stage
function render() {}

// baralha as cartas no tabuleiro
function scramble() {
  let allCards = Array.from(document.querySelectorAll(".carta"));
  let shuffled = allCards
    .filter((card) => !card.classList.contains("encontrada")) // Só baralha as cartas não encontradas
    .sort(() => Math.random() - 0.5); // Baralha aleatoriamente

  // Posiciona as cartas baralhadas no tabuleiro
  shuffled.forEach((card, index) => {
    const x = index % COLS;
    const y = Math.floor(index / ROWS);
    card.style.top = `${y * CARDSIZE}px`;
    card.style.left = `${x * CARDSIZE}px`;
    card.classList.add("escondida"); // Garante que as cartas ficam viradas para baixo
  });
}

let flipped = [];

function flipCard(card) {
  if (flipped.length < 2 && !card.classList.contains("encontrada")) {
    card.classList.remove("escondida"); // Vira a carta
    flipped.push(card);

    if (flipped.length === 2) {
      checkMatch(flipped);
    }
  }
}

function checkMatch(cards) {
  if (cards[0].dataset.country === cards[1].dataset.country) {
    cards[0].classList.add("encontrada");
    cards[1].classList.add("encontrada");
    flipped = []; // Reseta as cartas viradas
  } else {
    setTimeout(() => {
      cards[0].classList.add("escondida");
      cards[1].classList.add("escondida");
      flipped = []; // Reseta as cartas viradas
    }, 500); // Deixa as cartas vísiveis por 500ms antes de voltar a esconder
  }
}

function tempo() {
  let contador = 0;
  let maxCount = 60;

  let timeHandler = setInterval(() => {
    contador++;
    document.getElementById("time").value = contador;
    if (contador === maxCount - 5)
      document.getElementById("time").classList.add("warning");
    if (contador === maxCount) {
      clearInterval(timeHandler);
      document.getElementById("time").classList.remove("warning");
    }
  }, 1);
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */

// configuração do audio
function setupAudio() {
  game.sounds.background = document.querySelector("#backgroundSnd");
  game.sounds.success = document.querySelector("#successSnd");
  game.sounds.flip = document.querySelector("#flipSnd");
  game.sounds.hide = document.querySelector("#hideSnd");
  game.sounds.win = document.querySelector("#goalSnd");

  // definições de volume;
  game.sounds.background.volume = 0.05; // o volume varia entre 0 e 1

  // nesta pode-se mexer se for necessário acrescentar ou configurar mais sons
}

// calcula as coordenadas das imagens da selecao de cada país e atribui um código único
function getFaces() {
  /* NÂO MOFIFICAR ESTA FUNCAO */
  let offsetX = 1;
  let offsetY = 1;
  for (let i = 0; i < 3; i++) {
    offsetX = 1;
    for (let j = 0; j < 3; j++) {
      let countryFace = Object.create(face); // criar um objeto com base no objeto face
      countryFace.x = -(j * CARDSIZE + offsetX) + "px"; // calculo da coordenada x na imagem
      countryFace.y = -(i * CARDSIZE + offsetY) + "px"; // calculo da coordenada y na imagem
      countryFace.country = "" + i + "" + j; // criação do código do país
      faces.push(countryFace); // guardar o objeto no array de faces
      offsetX += 2;
    }
    offsetY += 2;
  }
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */
