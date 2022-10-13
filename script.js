'use strict';

function getRandom(min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));
}

const winElement = document.querySelector(".win")

const letters = "abcdefghijklmnopqrstuvxyzöäå"
let sampleWords = new Array("backscattering", "GoldenDelicious", "eggplant", "strawberry", "kiwi", "passionfruit", "peach", "avocado", "honeydew", "apple", "pear", "mango", "banana", "orange", "pineapple", "plum", "grapefruit", "watermelon", "tomato", "apricot", "tangerine", "dragonfruit")


class Cell {
    constructor(pos = "1-1") {
        this.domElement = document.createElement("div")
        this.domElement.classList.add("cell")
        this.domElement.dataset.position = pos
        this.letter = ""
        this.inWord = false
        this.filled = false
    }
    fillLetter(l) {
        this.letter = l
        this.domElement.innerText = this.letter
    }
    fillRandom() {
        this.letter = letters.charAt(Math.floor(Math.random() * letters.length))
        this.domElement.innerText = this.letter
    }
}

class Word {
    constructor(word, color = Math.floor(Math.random() * 255)) {
        this.word = word;
        this.length = word.length
        this.random = Math.random()
        this.position = {
            x: 0,
            y: 0
        }
        this.cells = []
        this.color = color
        this.tries = 0
        this.skipped = false
        this.found = false
    }

    newPosition() {
        this.tries++
        if (this.tries % 5) this.random = Math.random()
        let length = this.word.length
        if (this.random > .75) {
            this.position.x = getRandom(0, (15 - length))
            this.position.y = getRandom(0, 15)
        } else if (this.random > .50) {
            this.position.x = getRandom(0, 15)
            this.position.y = getRandom(0, (15 - length))
        } else if (this.random > .25) {
            this.position.x = getRandom(0, (15 - length))
            this.position.y = getRandom(0, (15 - length))
        } else {
            this.position.x = getRandom(length, 15)
            this.position.y = getRandom(0, (15 - length))
        }
    }

    updatePosition() {
        if (this.random > .75) {
            this.position.x = this.position.x + 1
            this.position.y = this.position.y
        } else if (this.random > .50) {
            this.position.x = this.position.x
            this.position.y = this.position.y + 1
        } else if (this.random > .25) {
            this.position.x = this.position.x + 1
            this.position.y = this.position.y + 1
        } else {
            this.position.x = this.position.x - 1
            this.position.y = this.position.y + 1
        }
    }

    updateBackground() {
        for (let x of this.cells) {
            x.domElement.style.background = `hsl(${this.color},70%,80%)`
            x.domElement.style.boxShadow = `0 0 0 .25rem hsl(${this.color},70%,80%)`
        }
    }
}

class Board {
    constructor(size = 16) {
        this.size = size
        this.domElement = document.querySelector(".board")
        this.wordList = []
        this.wordListDom = document.querySelector(".word-list")
        this.cells = []
        this.words = []
    }

    makeBoard(w) {
        for (let i = 0; i < this.size; i++) {
            this.cells.push([])
            for (let j = 0; j < this.size; j++) {
                this.cells[i].push(new Cell(`${i}-${j}`))
                this.cells[i][j].fillRandom()
                this.domElement.append(this.cells[i][j].domElement)
            }
        }

        for (let i = 0; i < w.length; i++) {
            let newWord = new Word(w[i], (255 / w.length) * i)
            this.words.push(newWord)
            this.words[i].newPosition()
        }

        for (let i = 0; i < this.words.length; i++) {
            let failed = false
            for (let j = 0; j < this.words[i].length; j++) {

                if (this.cells[this.words[i].position.x][this.words[i].position.y].filled) {
                    failed = true
                    break
                }

                this.words[i].cells.push(this.cells[this.words[i].position.x][this.words[i].position.y])
                this.words[i].updatePosition()

            }
            if (failed) {
                if (this.words[i].tries > 100) {
                    this.words[i].skipped = true
                    console.log("skipped " + this.words[i].word)
                    this.words[i].found = true
                    continue
                }
                this.words[i].cells = []
                this.words[i].newPosition()
                i--

            } else {
                for (let k = 0; k < this.words[i].cells.length; k++) {
                    this.words[i].cells[k].fillLetter(this.words[i].word[k])
                    this.words[i].cells[k].filled = true
                    this.words[i].cells[k].inWord = this.words[i]
                }
            }
        }
       
        for (let x of this.words) {
            if (!x.skipped) {
                let newListItem = document.createElement("li")
                newListItem.innerText = x.word.toUpperCase()
                this.wordList.push(newListItem)
                this.wordListDom.append(newListItem)
            }
        }
    }

    clearBoard() {
        this.words = []
        this.cells = []
        this.wordList = []
        let child = this.domElement.lastElementChild
        let listChild = this.wordListDom.lastElementChild
        while (child) {
            this.domElement.removeChild(child)
            child = this.domElement.lastElementChild
        }
        while (listChild) {
            this.wordListDom.removeChild(listChild)
            listChild = this.wordListDom.lastElementChild
        }
    }

    checkWin() {
        for (let x of this.words) {
            if (!x.found) {
                return false
            }
        }
        return true
    }


}

let board = new Board()

board.makeBoard(sampleWords)

let dragHistory = []
let clicked = false

board.domElement.addEventListener("mousedown", (e) => {
    if (e.target != board.domElement) {
        e.target.classList.add("active")
        dragHistory.push(e.target)
    }
    clicked = true
})

board.domElement.addEventListener("mouseover", (e) => {
    if (clicked && e.target != board.domElement) {
        e.target.classList.add("active")
        dragHistory.push(e.target)
    }
})

board.domElement.addEventListener("mouseup", (e) => {
    let draggedWord = ""
    for (let cell of dragHistory) {
        cell.classList.remove("active")
        draggedWord += cell.innerText
    }

    for (let w of board.words) {
        if (w.word.toUpperCase() === draggedWord) {
            console.log("found one")
            w.found = true
            w.updateBackground()
        }
    }

    for (let w of board.wordList) {
        if (w.innerText === draggedWord.toUpperCase()) {
            w.found = true
            w.style.textDecoration = "line-through"
        }
    }

    dragHistory = []
    clicked = false

    if (board.checkWin()) {
        winElement.classList.add("win-active")
    }

})

const wordListButton = document.querySelector(".word-list-btn")
const generateButton = document.querySelector(".generate-btn")
const wordList = document.querySelector(".word-list")

wordListButton.addEventListener("click", () => {
    wordList.classList.toggle("word-list-active")
})

const wordInputArea = document.querySelector(".words-input")
const createButton = document.querySelector(".create")

createButton.addEventListener("click", () => {

    let words = wordInputArea.value.split("\n")
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].trim()
    }
    board.clearBoard()

    console.log(words.length)
    console.log(words)

    for(let i = 0;i<words.length;i++){
        if(words[i].length > 15){
            console.log("skipped " + words.splice(i,1)[0])
        }
    }


    if (words.length <= 1 && words[0] === ""){
        board.makeBoard(sampleWords)
    }
    else{
    board.makeBoard(words)
    }


    wordList.classList.add("word-list-active")
    winElement.classList.remove("win-move")
    winElement.classList.remove("win-active")
})

winElement.addEventListener("click", () => {
    winElement.classList.toggle("win-move")

})