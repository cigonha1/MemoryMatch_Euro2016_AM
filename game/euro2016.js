/**
 * Aplicações multimédia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 *
 */

const game = {}; // encapsula a informação do jogo. Está vazio mas será preenchido com definições adicionais.

// sons do jogo
const sounds = {
  background: "",
  flip: "",
  success: "",
  hide: "",
  win: "",
};

// número de linhas e colunas do tabuleiro
const ROWS = 4;
const COLS = 4;

game.sounds = sounds; // Adiciona os sons do jogo ao objeto game.
game.board = Array(COLS)
  .fill()
  .map(() => Array(ROWS)); // criação do tabuleiro como um array de 6 linhas x 8 colunas

// Representa a imagem de uma carta de um país. Esta definição é apenas um modelo para outros objetos que sejam criados
// com esta base através de let umaFace = Object.create(face).
const face = {
  country: -1,
  x: -1,
  y: -1,
};

const CARDSIZE = 102; // tamanho da carta (altura e largura)
let faces = []; // Array que armazena objetos face que contêm posicionamentos da imagem e códigos dos países

window.addEventListener("load", init, false);

function init() {
  game.stage = document.querySelector("#stage");
  setupAudio(); // configurar o áudio
  getFaces(); // calcular as faces e guardar no array faces
  createCountries(); // criar países
  tempo(); // iniciar o temporizador
  sounds.background.play();
}

// Cria os países e coloca-os no tabuleiro de jogo (array board[][])
function createCountries() {
  let indices = [...Array(8).keys(), ...Array(8).keys()]; // Cria um array com 8 elementos duplicados
  indices.sort(() => Math.random() - 0.5); // Baralha os índices

  for (let i = 0; i < 16; i++) {
    let umaCarta = document.createElement("div");
    umaCarta.classList.add("carta", "escondida"); // Aplica as classes "carta" e "escondida" do CSS

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

  // Separate matched and unmatched cards
  let matchedCards = allCards.filter((card) =>
    card.classList.contains("encontrada")
  );
  let unmatchedCards = allCards.filter(
    (card) => !card.classList.contains("encontrada")
  );

  // Grid para todas as posições
  let usedPositions = new Set();

  // Marcar as posições das encontradas como utilizadas
  matchedCards.forEach((card) => {
    let top = parseInt(card.style.top) || 0;
    let left = parseInt(card.style.left) || 0;
    usedPositions.add(`${top},${left}`);
    card.style.position = "absolute";
    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    card.style.zIndex = "1"; // z-index inferior para cartas encontradas
  });

  // Encontrar posições disponíveis para cartas não encontradas
  let availablePositions = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let pos = `${y * CARDSIZE},${x * CARDSIZE}`;
      if (!usedPositions.has(pos)) {
        availablePositions.push({
          x: x * CARDSIZE,
          y: y * CARDSIZE,
        });
      }
    }
  }

  // Baralhar as posições disponíveis
  availablePositions.sort(() => Math.random() - 0.5);

  // Colocar as cartas não encontradas nas posições disponíveis
  unmatchedCards.forEach((card, index) => {
    if (index < availablePositions.length) {
      card.style.position = "absolute";
      card.style.top = `${availablePositions[index].y}px`;
      card.style.left = `${availablePositions[index].x}px`;
      card.style.zIndex = "2"; // z-index superior para cartas não encontradas
      card.classList.add("escondida");
    }
  });
}

let flipped = [];

function flipCard(card) {
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
    cards.forEach((card) => card.classList.add("encontrada", "matched")); // Marca as cartas como encontradas e aplica a animação
    game.sounds.success.play();
    flipped = []; // Reseta as cartas viradas
    checkForWin();
  } else {
    setTimeout(() => {
      cards.forEach((card) => card.classList.add("escondida")); // Volta a virar as cartas
      game.sounds.hide.play();
      flipped = []; // Reseta as cartas viradas
    }, 500); // Deixa as cartas visíveis por 500ms antes de voltar a esconder
  }
}

// Verifica se o jogador ganhou
function checkForWin() {
  let allCards = Array.from(document.querySelectorAll(".carta"));
  let unmatchedCards = allCards.filter(
    (card) => !card.classList.contains("encontrada")
  );

  if (unmatchedCards.length === 0) {
    // Obter o tempo final
    let finalTime = document.getElementById("time").value;

    // Criar div com sumário
    let summary = document.createElement("div");
    summary.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1f4952;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 100;
    `;
    summary.innerHTML = `
      <h2>Parabéns!</h2>
      <p>Completaste o jogo em ${finalTime} segundos!</p>
      <p>Pressiona ESPAÇO para jogar novamente</p>
    `;
    document.body.appendChild(summary);

    sounds.win.play();
    clearInterval(timeHandler); // Parar o temporizador

    setTimeout(() => {
      document.body.removeChild(summary);
      restartGame();
    }, 30000);
  }
}

function restartGame() {
  // Reseta as variáveis do jogo
  flipped = [];

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
    // Remover o sumário se existir
    const summary = document.querySelector("div[style*='z-index: 100']");
    if (summary) {
      document.body.removeChild(summary);
    }
    restartGame();
  }
});

let timeHandler;

function tempo() {
  let contador = 0;
  let maxCount = 45;

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
      // Resetar cartas viradas, mas não encontradas
      flipped.forEach((card) => {
        if (!card.classList.contains("encontrada")) {
          card.classList.add("escondida");
        }
      });
      flipped = [];
      scramble(); // Baralhar
      contador = 0; // Reiniciar o contador
      tempo(); // Reiniciar o temporizador
    }
  }, 1000);
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */

// configuração do áudio
function setupAudio() {
  game.sounds.background = document.querySelector("#backgroundSnd");
  game.sounds.success = document.querySelector("#successSnd");
  game.sounds.flip = document.querySelector("#flipSnd");
  game.sounds.hide = document.querySelector("#hideSnd");
  game.sounds.win = document.querySelector("#goalSnd");

  // definições de volume
  game.sounds.background.volume = 0.05; // o volume varia entre 0 e 1

  // nesta pode-se mexer se for necessário acrescentar ou configurar mais sons
}

// calcula as coordenadas das imagens da seleção de cada país e atribui um código único
function getFaces() {
  /* NÃO MODIFICAR ESTA FUNÇÃO */
  let offsetX = 1;
  let offsetY = 1;
  for (let i = 0; i < 3; i++) {
    offsetX = 1;
    for (let j = 0; j < 3; j++) {
      let countryFace = Object.create(face); // criar um objeto com base no objeto face
      countryFace.x = -(j * CARDSIZE + offsetX) + "px"; // cálculo da coordenada x na imagem
      countryFace.y = -(i * CARDSIZE + offsetY) + "px"; // cálculo da coordenada y na imagem
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
