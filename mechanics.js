function Game() {
    this.cardGrid = document.querySelector(".cards-grid");
    this.availableEmojies = ["🐹", "🐨", "🐊", "🐵", "🐶", "🐙"];
    this.cards = [];
    this.openedCards = [];
    this.confirmedPairs = [];
    this.status = "";
    this.timerId = null;
}

Game.prototype.openCard = function (card) {
    if(this.openedCards.length == 0){
        this.openedCards.push(card);
        card.open();
    }
    else if(this.openedCards.length == 1){
        this.openedCards.push(card);
        card.open();
        var comparison = this.comparePair(this.openedCards);
        if (comparison == "confirmed"){
            this.openedCards = [];
        }
    }
    else{
        this.openedCards.forEach(function (openedCard) {
            openedCard.close();
        })
        this.openedCards = [];
        this.openedCards.push(card);
        card.open();
    }
}

Game.prototype.comparePair = function(pair){
    var result = "";
    if(pair[0].symbol == pair[1].symbol){
        this.confirmPair(pair);
        this.confirmedPairs.push(pair);
        result = "confirmed";
        if(this.confirmedPairs.length == this.availableEmojies.length){
            this.status = "Win";
        }
    }
    else{
        this.rejectPair(pair);
        result = "rejected";
    }
    return result;
};

Game.prototype.confirmPair = function (pair) {
    pair.forEach(function (card) {
        card.node.children[1].classList.add("confirmed");
    })
}

Game.prototype.rejectPair = function (pair) {
    pair.forEach(function (card) {
        card.node.children[1].classList.add("rejected");
    })
}

Game.prototype.generateDesk = function () {
    var emojiCounter = {};
    this.availableEmojies.forEach(function (emoji) {
        emojiCounter[emoji] = 0;
    });

    for(var i = 0; i < this.availableEmojies.length * 2; i++){
        var emoji = this.getRandomEmoji(emojiCounter);
        var cardNode = this.createCardNode(emoji);
        this.cardGrid.appendChild(cardNode);

        var card = new Card(cardNode, emoji);
        this.cards.push(card);
    }
}

Game.prototype.getRandomEmoji = function (emojiCounter) {

    var randomIndex = Math.floor(Math.random() * Math.floor(12));
    var randomEmoji = this.availableEmojies[randomIndex];

    if(emojiCounter[randomEmoji] < 2){
        emojiCounter[randomEmoji]++;
        return randomEmoji;
    }
    else{
        return this.getRandomEmoji(emojiCounter);
    }
}

Game.prototype.createCardNode = function(symbol) {

    var card = document.createElement("div");
    var frontSide = document.createElement("div");
    var backSide = document.createElement("div");
    var emoji = document.createElement("p");

    card.classList.add("card");
    frontSide.classList.add("card-front");
    backSide.classList.add("card-back");
    emoji.classList.add("emoji");

    emoji.textContent = symbol;
    backSide.appendChild(emoji);

    card.appendChild(frontSide);
    card.appendChild(backSide);

    return card;
}

Game.prototype.timer = function(secondsNode, minutesNode){
    var timerHandler = (function () {
        if(+minutesNode.textContent > 0){
            if(+secondsNode > 0){
                secondsNode.textContent--;
            }
            else {
                minutesNode.textContent--;
                if (minutesNode.textContent < 10) {
                    minutesNode.textContent = "0" + minutesNode.textContent;
                }
                secondsNode.textContent = "59";
            }
        }
        else{
            secondsNode.textContent--;
            if(+secondsNode.textContent < 10){
                if(secondsNode.textContent == "0"){
                    this.status = "Lose";
                    clearInterval(this.timerId);
                }
                secondsNode.textContent = "0" + secondsNode.textContent;
            }
        }
    }
        ).bind(this);

    this.timerId = setInterval(timerHandler, 1000);
}

function createPupupWindow(gameResult, game) {
    var overlay = document.createElement("div");
    overlay.classList.add("overlay");

    var popup = document.createElement("div");
    popup.classList.add("popup");

    var word = document.createElement("ul");
    word.classList.add("popup-result");

    for(var letter of gameResult){
        var letterElement = document.createElement("li");
        letterElement.textContent = letter;
        letterElement.classList.add("jumping-letter");
        word.appendChild(letterElement);
    }

    var button = document.createElement("button");
    button.classList.add("popup-button");
    var buttonText;
    if(game.status == "Win"){
        buttonText = "Play again";
    }
    else if(game.status == "Lose"){
        buttonText = "Try again";
    }

    button.textContent = buttonText;
    enableButtonListener(button);
    popup.appendChild(word);
    popup.appendChild(button);
    overlay.appendChild(popup);

    return overlay;
}

function enableButtonListener(button) {
    button.addEventListener("click", function () {
        clearDesk();
        startGame();
    });
}

function clearDesk() {
    var cardGrid = document.querySelector(".cards-grid");
    var main = document.querySelector("main");

    main.removeChild(document.querySelector(".overlay"));
    main.removeChild(cardGrid);

    document.getElementById("minutes").textContent = "01"
    document.getElementById("seconds").textContent = "00";

    var newDesk = document.createElement("div");
    newDesk.classList.add("cards-grid");
    document.querySelector(".title").after(newDesk);
}

function enableCardGridListener(game){
    game.cardGrid.addEventListener("click", function (e) {
        if(e.target.classList.contains("card-front")) {
            var targetCard = null;
            for (var i = 0; i < game.cards.length; i++) {
                if (game.cards[i].node.children[0] === e.target) {
                    targetCard = game.cards[i];
                    break;
                }
            }
            if(game.status == ""){
                game.timer(document.getElementById("seconds"), document.getElementById("minutes"));
                game.status = "acting";
            }
            game.openCard(targetCard);
    }});
}

function Card(node, symbol) {
    this.node = node;
    this.symbol = symbol;
}

Card.prototype.open = function () {
    this.node.children[0].classList.add("animated-front");
    this.node.children[1].classList.add("animated-back");
}

Card.prototype.close = function () {
    this.node.children[0].classList.remove("animated-front");
    this.node.children[1].classList.remove("animated-back");
    this.node.children[1].classList.remove("rejected");
}

function startGame(){
    var game = new Game();
    game.generateDesk();
    enableCardGridListener(game);
    var end = setInterval(function () {
        if(game.status == "Win" || game.status == "Lose"){
            document.querySelector("main").appendChild(createPupupWindow(game.status, game));
            clearInterval(game.timerId);
            clearInterval(end);
        }
    }, 500);
}

startGame();
