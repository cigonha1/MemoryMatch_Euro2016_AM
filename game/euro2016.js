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
  win: "",
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
  tempo(); // iniciar o temporizador
  sounds.background.play();
}

// Cria os paises e coloca-os no tabuleiro de jogo(array board[][])
function createCountries() {
  let indices = [...Array(8).keys(), ...Array(8).keys()]; // Cria um array 8 elementos
  indices.sort(() => Math.random() - 0.5); // Baralha os indices

  for (let i = 0; i < 16; i++) {
    let umaCarta = document.createElement("div");
    umaCarta.classList.add("carta", "escondida");

    // Posição da carta com base nas coordenadas das faces
    umaCarta.style.backgroundPositionX = faces[indices[i]].x;
    umaCarta.style.backgroundPositionY = faces[indices[i]].y;
    umaCarta.dataset.country = faces[indices[i]].country; // Atribui o país à carta

    // Define tamanho e posição das cartas
    umaCarta.style.width = `${CARDSIZE}px`;
    umaCarta.style.height = `${CARDSIZE}px`;

    // Adiciona as cartas ao tabuleiro
    game.stage.appendChild(umaCarta);

    // Adiciona o evento de clique para virar as cartas
    umaCarta.addEventListener("click", () => flipCard(umaCarta));
  }
  scramble();
}

// Baralha as cartas no tabuleiro
function scramble() {
  let allCards = Array.from(document.querySelectorAll(".carta"));

  // Posiciona as cartas baralhadas no tabuleiro
  allCards.forEach((card, index) => {
    const x = index % COLS;
    const y = Math.floor(index / ROWS);
    card.style.top = `${y * CARDSIZE}px`;
    card.style.left = `${x * CARDSIZE}px`;
  });

  let shuffled = allCards
    .filter((card) => !card.classList.contains("encontrada")) // Só baralha as cartas não encontradas
    .sort(() => Math.random() - 0.5); // Baralha aleatoriamente

  // Posiciona as cartas baralhadas no tabuleiro
  shuffled.forEach((card) => {
    card.style.position = "absolute"; // Garante que o posicionamento é absoluto
  });
  tempo(); // Reinicia o temporizador
}

let flipped = [];

function flipCard(card) {
  sounds.background.play();
  if (
    flipped.length < 2 &&
    !card.classList.contains("encontrada") &&
    !flipped.includes(card)
  ) {
    card.classList.remove("escondida"); // Vira a carta
    flipped.push(card);

    if (flipped.length === 2) {
      checkMatch(flipped);
    }
  }
}

// Verifica se encontrou o par
function checkMatch(cards) {
  if (cards[0].dataset.country === cards[1].dataset.country) {
    cards.forEach((card) => card.classList.add("encontrada")); // Marca as cartas como encontradas
    game.sounds.success.play();
    flipped = []; // Reseta as cartas viradas
    checkForWin();
  } else {
    setTimeout(() => {
      cards.forEach((card) => card.classList.add("escondida")); // Volta a virar as cartas
      game.sounds.hide.play();
      flipped = []; // Reseta as cartas viradas
    }, 500); // Deixa as cartas vísiveis por 500ms antes de voltar a esconder
  }
}

// Verificar se o jogador ganhou
function checkForWin() {
  let allCards = Array.from(document.querySelectorAll(".carta"));
  let unmatchedCards = allCards.filter(
    (card) => !card.classList.contains("encontrada")
  );

  if (unmatchedCards.length === 0) {
    // Todas as cartas foram encontradas
    console.log("Ganhaste o jogo!");
    sounds.win.play(); // Toca o som de vitória
    setTimeout(restartGame, 3000); // Recomeça o jogo após 3 segundos
  }
}

function restartGame() {
  // Reseta as variáveis do jogo
  flipped = [];
  backgroundSoundPlaying = false;

  // Limpar o tabuleiro
  game.stage.innerHTML = "";

  // Recriar as cartas e recomeçar o jogo
  createCountries();
  tempo();
  game.sounds.background.play();
}

// Adiciona o evento para recomeçar a qualquer momento
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    restartGame();
  }
});

let timeHandler;

function tempo() {
  let contador = 0;
  let maxCount = 45;

  // Apagar qualquer timer anterior
  if (timeHandler) {
    clearInterval(timeHandler);
  }

  timeHandler = setInterval(() => {
    contador++;
    document.getElementById("time").value = contador;

    if (contador === maxCount - 5) {
      document.getElementById("time").classList.add("warning");
    }

    if (contador === maxCount) {
      clearInterval(timeHandler);
      document.getElementById("time").classList.remove("warning");
      scramble(); // Baralha as cartas novamente
      tempo(); // Restart the timer
      contador = 0; // Reset the contador
    }
  }, 1000);
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
