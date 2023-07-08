import "./site.css";

import { GameState } from "./gameState";
import { Card } from "./card";
import { RunTests as RunTests } from "./tests";
import { Mana } from "./mana";
import { Land } from "./land";
import { CleanDatabase, LoadDatabase, ReadDeckData } from "./deckImport";

const mainDiv = document.getElementById('main') as HTMLDivElement;
const simulatedGamesInput = document.getElementById('simulatedGames') as HTMLInputElement;
const deckInput = document.getElementById('deckInput') as HTMLTextAreaElement;
const runSimulationButton = document.getElementById('runSimulation') as HTMLButtonElement;
const importDeckButton = document.getElementById('importDeck') as HTMLButtonElement;

let deck: Card[] = [];

function Initialize() {
    console.log("hi");
    mainDiv.innerText += "hi hi";
    LoadDatabase();
    //CleanDatabase();
    RunTests();
    CreateBaseDeck();
    GetOpeningHandStats();
}

function CreateBaseDeck() {
    let lands = Array(20).fill(new Land("Swamp", Mana.Black));
    let cards = Array(40).fill(new Card("Dark Ritual", [Mana.Black]));
    deck = [...lands, ...cards];
}

function GetOpeningHandStats() {
    let num = Math.floor(parseFloat(simulatedGamesInput.value));
    
    let state = GameState.CreateWithDeck(deck);
    let landNumbers = Array(8).fill(0);
    console.log("Starting simulations");
    for (let i = 0; i < num; i++) {
        if (i > 0 && i%1000 == 0) {
            let message = i + " simulations finished";
            mainDiv.innerText = message;
            console.log(message);
        }
        state.ShuffleHandToDeck();
        state.DrawCard(7);
        let landNumber = 0;
        for (let c = 0; c < state.hand.length; c++) {
            let card = state.hand[c];
            if (card instanceof Land) {
                landNumber++;
            }
        }
        landNumbers[landNumber]++;
    }
    state.ShuffleHandToDeck();
    let result = "";
    for (let i = 0; i < landNumbers.length; i++) {
        result += "Chance to start with " + i + " lands: " + (100*landNumbers[i]/num).toFixed(2) + "%\n";
    }
    mainDiv.innerText = result;
    console.log(result);
}

Initialize();

runSimulationButton.onclick = (ev) => {GetOpeningHandStats();};
importDeckButton.onclick = (ev) => {
    deck = ReadDeckData(deckInput.value);
    console.log("Imported deck data");
};
