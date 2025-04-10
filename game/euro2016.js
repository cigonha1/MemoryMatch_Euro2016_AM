/**
 * Aplicações multimédia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 *
 */

const game =
  {}; /* encapsula a informação do jogo. Está vazio mas será preenchido com definições adicionais. */

/* sons do jogo */
const sounds = {
  background: "",
  flip: "",
  success: "",
  hide: "",
  win: "",
};

/* número de linhas e colunas do tabuleiro */
const ROWS = 4;
const COLS = 4;

game.sounds = sounds; /* Adiciona os sons do jogo ao objeto game. */
game.board = Array(COLS)
  .fill()
  .map(() =>
    Array(ROWS)
  ); /* criação do tabuleiro como um array de 4 linhas x 4 colunas */

/* Representa a imagem de uma carta de um país. Esta definição é apenas um modelo para outros objetos que sejam criados
   com esta base através de let umaFace = Object.create(face). */
const face = {
  country: -1,
  x: -1,
  y: -1,
};

const CARDSIZE = 102; /* tamanho da carta (altura e largura) */
let faces =
  []; /* Array que armazena objetos face que contêm posicionamentos da imagem e códigos dos países */

window.addEventListener("load", init, false);

function init() {
  game.stage = document.querySelector("#stage");
  setupAudio(); /* configura o áudio */
  getFaces(); /* calcula as faces e guardar no array faces */
  createCountries(); /* cria países */
  tempo(); /* inicia o temporizador */

  /* Espera interação para começar a música */
  document.addEventListener("click", playBgSnd, { once: true });
}

function playBgSnd() {
  sounds.background.play().catch((error) => {
    console.error("Falha ao inciar a música:", error);
  });
}

/* Cria os países e coloca-os no tabuleiro de jogo (array board[][]) */
function createCountries() {
  /* Limpa o tabuleiro antes de criar novas cartas */
  game.stage.innerHTML = "";

  let indices = [
    ...Array(8).keys(),
    ...Array(8).keys(),
  ]; /* Cria um array com 8 elementos duplicados */
  indices.sort(() => Math.random() - 0.5); /* Baralha os índices */

  for (let i = 0; i < 16; i++) {
    let umaCarta = document.createElement("div");
    umaCarta.classList.add(
      "carta",
      "escondida"
    ); /* Aplica as classes "carta" e "escondida" do CSS */

    /* Posição da carta com base nas coordenadas das faces */
    umaCarta.style.backgroundPositionX = faces[indices[i]].x;
    umaCarta.style.backgroundPositionY = faces[indices[i]].y;
    umaCarta.dataset.country =
      faces[indices[i]].country; /* Atribui o país à carta */

    /* Define tamanho e posição das cartas */
    umaCarta.style.width = `${CARDSIZE}px`;
    umaCarta.style.height = `${CARDSIZE}px`;
    umaCarta.style.position = "absolute";
    umaCarta.style.top = `${Math.floor(i / COLS) * CARDSIZE}px`;
    umaCarta.style.left = `${(i % COLS) * CARDSIZE}px`;

    game.stage.appendChild(umaCarta); /* Adiciona as cartas ao tabuleiro */

    /* Evento de clique para virar as cartas */
    umaCarta.addEventListener("click", () => flipCard(umaCarta));
  }
  scramble();
}

/* Baralha as cartas no tabuleiro */
function scramble() {
  let allCards = Array.from(document.querySelectorAll(".carta"));

  /* Separa as cartas encontradas e não encontradas */
  let matchedCards = allCards.filter((card) =>
    card.classList.contains("encontrada")
  );
  let unmatchedCards = allCards.filter(
    (card) => !card.classList.contains("encontrada")
  );

  /* Vira todas as cartas não encontradas para cima */
  unmatchedCards.forEach((card) => {
    card.classList.remove("escondida");
  });

  /* Momento para mostrar as cartas */
  setTimeout(() => {
    let usedPositions = new Set(); /* Grid para todas as posições */

    /* Marca as posições das encontradas como utilizadas */
    matchedCards.forEach((card) => {
      let top = parseInt(card.style.top) || 0;
      let left = parseInt(card.style.left) || 0;
      usedPositions.add(`${top},${left}`);
      card.style.position = "absolute";
      card.style.top = `${top}px`;
      card.style.left = `${left}px`;
      card.style.zIndex = "1"; /* z-index inferior para cartas encontradas */
    });

    /* Encontra posições disponíveis para cartas não encontradas */
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

    availablePositions.sort(
      () => Math.random() - 0.5
    ); /* Baralha as posições disponíveis */

    /* Reposiciona as cartas não encontradas nas posições disponíveis */
    unmatchedCards.forEach((card, index) => {
      if (index < availablePositions.length) {
        card.style.position = "absolute";
        card.style.top = `${availablePositions[index].y}px`;
        card.style.left = `${availablePositions[index].x}px`;
        card.style.zIndex =
          "2"; /* z-index superior para cartas não encontradas */
      }
    });

    /* Momento para mostrar as cartas nas novas posições
    e só depois escondê-las */
    setTimeout(() => {
      unmatchedCards.forEach((card) => {
        card.classList.add("escondida");
      });
    }, 1000);
  }, 1000);
}

let flipped = [];

function flipCard(card) {
  if (
    flipped.length < 2 &&
    !card.classList.contains("encontrada") &&
    !flipped.includes(card)
  ) {
    card.classList.remove("escondida"); /* Vira a carta */
    game.sounds.flip.play();
    flipped.push(card);

    if (flipped.length === 2) {
      checkMatch(flipped);
    }
  }
}

/* Verifica se encontrou o par */
function checkMatch(cards) {
  if (cards[0].dataset.country === cards[1].dataset.country) {
    cards.forEach((card) =>
      card.classList.add("encontrada", "matched")
    ); /* Marca as cartas como encontradas e aplica a animação */
    game.sounds.success.play();
    flipped = []; /* Reseta o array de cartas viradas */
    checkForWin();
  } else {
    setTimeout(() => {
      cards.forEach((card) =>
        card.classList.add("escondida")
      ); /* Volta a virar as cartas */
      game.sounds.hide.play();
      flipped = [];
    }, 500); /* Deixa as cartas visíveis por 500ms antes de voltar a esconder */
  }
}

let timeoutHandler; // Store the timeout reference globally

/* Verifica se o jogador ganhou */
function checkForWin() {
  let allCards = Array.from(document.querySelectorAll(".carta"));
  let unmatchedCards = allCards.filter(
    (card) => !card.classList.contains("encontrada")
  );

  if (unmatchedCards.length === 0) {
    /* Criar um div com o sumário de jogo */
    let summary = document.createElement("div");
    summary.classList.add("summary");
    summary.innerHTML = `
      <h2>Parabéns!</h2>
      <p>Completaste o jogo em ${globalTime} segundos!</p>
      <p>Pressiona ESPAÇO para jogar novamente</p>
    `;
    document.body.appendChild(summary);

    sounds.win.play();
    clearInterval(timeHandler); /* Para o temporizador */

    /* Verifica se o sumário existe */
    timeoutHandler = setTimeout(() => {
      if (document.body.contains(summary)) {
        document.body.removeChild(summary);
      }
      restartGame();
    }, 5000);
  }
}

function restartGame() {
  /* Reseta as variáveis de jogo */
  flipped = [];
  globalTime = 0;

  /* Remove o sumário de jogo, se existir */
  const summary = document.querySelector("div[style*='z-index: 100']");
  if (summary && document.body.contains(summary)) {
    document.body.removeChild(summary);
  }

  /* Limpa o tabuleiro */
  game.stage.innerHTML = "";

  /* Recria o tabuleiro e reinicia o jogo */
  createCountries();
  tempo();
}

/* Evento para reiniciar o jogo ao pressionar a tecla "Espaço" */
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    const summary = document.querySelector(".summary");
    if (summary && document.body.contains(summary)) {
      document.body.removeChild(summary);
    }

    /* Cancela timeout de 5 segundos */
    if (timeoutHandler) {
      clearTimeout(timeoutHandler);
      timeoutHandler = null;
    }
    restartGame();
  }
});

let timeHandler;
let globalTime = 0; /* Cronómetro global */

function tempo() {
  let localTime = 0; /* Cronómetro local */
  const maxTime = 45;
  const timeElement = document.getElementById("time");
  timeElement.classList.remove(
    "warning"
  ); /* Garante que a classe warning não está aplicada no início */

  if (timeHandler) {
    clearInterval(timeHandler);
  }

  timeHandler = setInterval(() => {
    globalTime++;
    localTime++;

    timeElement.value = localTime; /* Atualiza a barra de progresso */

    /* Warning de 5 segundos */
    if (localTime >= maxTime - 5) {
      if (!timeElement.classList.contains("almost")) {
        timeElement.classList.add("almost");
      }
    } else {
      timeElement.classList.remove("almost");
    }

    if (localTime === maxTime) {
      timeElement.classList.remove("almost"); /* Remove a classe warning */

      /* Esconde qualquer carta que esteja virada */
      flipped.forEach((card) => {
        if (!card.classList.contains("encontrada")) {
          card.classList.add("escondida");
        }
      });
      flipped = [];
      scramble(); /* Baralha */
      localTime = 0; /* Reinicia */
    }
  }, 1000);
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */

/* configuração do áudio */
function setupAudio() {
  game.sounds.background = document.querySelector("#backgroundSnd");
  game.sounds.success = document.querySelector("#successSnd");
  game.sounds.flip = document.querySelector("#flipSnd");
  game.sounds.hide = document.querySelector("#hideSnd");
  game.sounds.win = document.querySelector("#goalSnd");

  /* definições de volume */
  game.sounds.background.volume = 0.05; /* o volume varia entre 0 e 1 */

  /* nesta pode-se mexer se for necessário acrescentar ou configurar mais sons */
}

/* calcula as coordenadas das imagens da seleção de cada país e atribui um código único */
function getFaces() {
  /* NÃO MODIFICAR ESTA FUNÇÃO */
  let offsetX = 1;
  let offsetY = 1;
  for (let i = 0; i < 3; i++) {
    offsetX = 1;
    for (let j = 0; j < 3; j++) {
      let countryFace =
        Object.create(face); /* cria um objeto com base no objeto face */
      countryFace.x =
        -(j * CARDSIZE + offsetX) +
        "px"; /* cálculo da coordenada x na imagem */
      countryFace.y =
        -(i * CARDSIZE + offsetY) +
        "px"; /* cálculo da coordenada y na imagem */
      countryFace.country = "" + i + "" + j; /* criação do código do país */
      faces.push(countryFace); /* guarda o objeto no array de faces */
      offsetX += 2;
    }
    offsetY += 2;
  }
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */
