import { GetDeckPrettyString, LoadFile, ReadDeckData, SaveFile } from "./deckImport";
import "./site.css";
import pdCardsText from "./data/pdCards.txt";

const deckLoadFileInput = document.getElementById('deckLoadFileInput') as HTMLInputElement;
const deckLoadButton = document.getElementById('deckLoadButton') as HTMLButtonElement;
const resultsTextArea: HTMLTextAreaElement = document.getElementById("results") as HTMLTextAreaElement;
const bannedCardsInputTextArea: HTMLTextAreaElement = document.getElementById("bannedCardsInput") as HTMLTextAreaElement;
const resultsTextDiv = document.getElementById("resultsText") as HTMLDivElement;

const randomGenerateInput = document.getElementById("randomGenerateInput") as HTMLInputElement;
const randomGenerateButton = document.getElementById("randomGenerateButton") as HTMLButtonElement;

let pdCards: { [index: string]: boolean; } = {};

let resultCardsText = "";

function Initialize() {
    GetPdCardsList();
    resultsTextArea.value = "Ready";
}

function Shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function GetPdCardsList() {
    let cards = pdCardsText.split("\n");
    pdCards = {};
    for (let i = 0; i < cards.length; i++) {
        pdCards[cards[i].trim()] = true;
    }
}

function GetPdRandomBanList() {
    let percent = parseFloat(randomGenerateInput.value);
    let cards = pdCardsText.split("\n");
    Shuffle(cards);
    bannedCardsInputTextArea.value = "";
    for (let i = 0; i < percent*0.01*cards.length; i++) {
        let card = cards[i].trim();
        if (card == "Mountain" || card == "Plains" || card == "Forest" || card == "Swamp" || card == "Island") {
            continue;
        }
        bannedCardsInputTextArea.value += card + "\n";
    }
}

function FindCardsToRemove(dataString: string) {
    let bannedCards = bannedCardsInputTextArea.value.split("\n").map(c => c.trim());
    let decks = dataString.split("====");
    decks = decks.map(d => d.trim().split(/\n\s*\n/)[0]);
    resultsTextDiv.innerText = "";
    for (let i = 0; i < decks.length; i++) {
        let removedCards = [];
        const deckString = decks[i];
        let deck = ReadDeckData(deckString);
        console.log("Imported deck data");
        for (let j = deck.length-1; j >= 0; j--) {
            let card = deck[j];
            if (bannedCards.indexOf(card.name) != -1) {
                deck.splice(j, 1);
                removedCards.push(card.name);
            }
        }
        resultsTextDiv.innerText += GetDeckPrettyString(deck);
        
        const countsRemoved: { [index: string]: number; } = {};
        removedCards.forEach(x => {countsRemoved[x] = (countsRemoved[x] || 0) + 1;});
        let removedString = "Removed:\n";
        for (let name in countsRemoved) {
            removedString += countsRemoved[name] + " " + name +"\n";
        }
        resultsTextDiv.innerText += removedString + "\n\n";
    }
    resultsTextArea.innerText = resultsTextDiv.innerText;
}

Initialize();

deckLoadButton.onclick = (ev) => {
    if (deckLoadFileInput.files != null && deckLoadFileInput.files.length > 0) {
        LoadFile(deckLoadFileInput.files[0], (s: string) => {
            FindCardsToRemove(s);
        });
    }
};
randomGenerateButton.onclick = (ev) => {
    GetPdRandomBanList();
};
