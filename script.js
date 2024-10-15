const cardContainer = document.getElementById('cardContainer');
const countdownDisplay = document.getElementById('countdown');

let numberOfPairs = 8; 
const cards = [];
let flippedCards = []; // 用來記錄已翻開的卡片
let matchedCount = 0;

// 監聽開始遊戲按鈕
document.getElementById('startGame').addEventListener('click', () => {
    generateCards();
    document.getElementById('startGame').style.display = 'none'; 
    document.querySelector('.theme-selection').style.display = 'none'; // 隱藏主題選擇
    document.querySelector('.button-container label').style.display = 'none'; // 隱藏卡片排列方式
    document.getElementById('gridSize').style.display = 'none'; // 隱藏選擇下拉框
    document.getElementById('hideMatched').parentNode.style.display = 'none'; // 隱藏隱藏已配對卡片的選項
});

// 監聽選擇的排列方式
document.getElementById('gridSize').addEventListener('change', (event) => {
    const selectedSize = event.target.value;
    updateGridSize(selectedSize);
});

// 更新卡片排列方式
function updateGridSize(size) {
    switch (size) {
        case '2':
            cardContainer.style.gridTemplateColumns = 'repeat(2, 1fr)'; // 2x2
            numberOfPairs = 2; // 2對卡片
            break;
        case '4':
            cardContainer.style.gridTemplateColumns = 'repeat(4, 1fr)'; // 4x4
            numberOfPairs = 8; // 8對卡片
            break;
        case '6':
            cardContainer.style.gridTemplateColumns = 'repeat(6, 1fr)'; // 6x6
            numberOfPairs = 18; // 18對卡片
            break;
    }
}

// 生成卡片
function generateCards() {
    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    const fruitEmojis = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🌽', '🍆'];

    cards.length = 0;
    cardContainer.innerHTML = '';

    for (let i = 0; i < numberOfPairs; i++) {
        for (let j = 0; j < 2; j++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = i;

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');

            // 根據主題設定正面內容
            if (selectedTheme === 'pirate') {
                const frontImg = document.createElement('img');
                frontImg.src = 'images/onepiece0.png'; // 海盜主題正面圖片
                frontImg.alt = `正面 ${i}`;
                cardFront.appendChild(frontImg);
            } else {
                // 水果主題
                const frontContent = document.createElement('div');
                frontContent.classList.add('fruit-front');
                frontContent.textContent = '⬛';
                cardFront.appendChild(frontContent);
            }

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');

            if (selectedTheme === 'pirate') {
                const backImg = document.createElement('img');
                backImg.src = `images/onepiece${i + 1}.png`; // 海盜主題背面圖片
                backImg.alt = `背面 ${i}`;
                cardBack.appendChild(backImg);
            } else {
                const backContent = document.createElement('div');
                backContent.classList.add('fruit-back');
                backContent.textContent = fruitEmojis[i % fruitEmojis.length]; // 根據索引選擇水果表情
                cardBack.appendChild(backContent);
            }

            card.appendChild(cardFront);
            card.appendChild(cardBack);
            card.addEventListener('click', () => {
                handleCardClick(card);
            });
            cards.push(card);
        }
    }
    shuffle(cards);
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });
    cards.forEach(card => {
        card.classList.add('flipped');
    });
    startCountdown(10);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startCountdown(seconds) {
    countdownDisplay.textContent = seconds;

    cards.forEach(card => {
        card.classList.add('disabled');
    });

    const interval = setInterval(() => {
        seconds--;
        countdownDisplay.textContent = seconds;
        if (seconds <= 1) {
            clearInterval(interval);
            flipCardsSequentially();
                countdownDisplay.textContent = "遊戲開始！";
                cards.forEach(card => {
                card.classList.remove('disabled');
            });
        }
    }, 1000);
}

document.getElementById('hideMatched').addEventListener('change', toggleMatchedCards);

function toggleMatchedCards() {
    const hideMatched = document.getElementById('hideMatched').checked;
    cards.forEach(card => {
        if (card.classList.contains('matched')) {
            card.style.visibility = hideMatched ? 'hidden' : 'visible';
        }
    });
}

function handleCardClick(card) {
    if (card.classList.contains('disabled') || card.classList.contains('matched') || flippedCards.length >= 2) {
        return;
    }
    document.getElementById('flopSound').play();

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        const [firstCard, secondCard] = flippedCards;

        if (firstCard === secondCard) {
            flippedCards.pop();
            return;
        }

        if (firstCard.dataset.index === secondCard.dataset.index) {
            setTimeout(() => {
                document.getElementById('winSound').play();
                firstCard.classList.add('matched');
                secondCard.classList.add('matched');
                flippedCards = [];
                matchedCount += 2;

                toggleMatchedCards();

                if (matchedCount === cards.length) {
                    setTimeout(() => {
                        document.getElementById('endSound').play();
                        Swal.fire({
                            title: "恭喜！",
                            text: "你完成了遊戲！",
                            icon: "success",
                            confirmButtonText: "重來"
                        }).then(() => {
                            resetGame();
                        });
                    }, 500);
                }
            }, 1000);
        } else {
            setTimeout(() => {
                document.getElementById('loseSound').play();
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }
}

function resetGame() {
    cardContainer.innerHTML = ''; // 清空卡片容器
    cards.length = 0; // 清空卡片數組
    flippedCards.length = 0; // 清空翻開的卡片數組
    matchedCount = 0; // 重置配對計數
    countdownDisplay.textContent = ''; // 清空倒計時顯示

    document.getElementById('startGame').style.display = 'inline'; // 顯示開始遊戲按鈕
    document.querySelector('.theme-selection').style.display = 'inline'; // 顯示主題選擇
    document.querySelector('.button-container label').style.display = 'inline'; // 顯示卡片排列方式
    document.getElementById('gridSize').style.display = 'inline'; // 顯示選擇下拉框
    document.getElementById('hideMatched').parentNode.style.display = 'inline'; // 顯示隱藏已配對卡片的選項
}

async function flipCardsSequentially() {
    for (const card of cards) {
        card.classList.remove('flipped');
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

document.getElementById('showFronts').addEventListener('click', () => {
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
});

document.getElementById('showBacks').addEventListener('click', () => {
    cards.forEach(card => {
        card.classList.add('flipped');
    });
});
