import { GameState } from "./GameState";
import { Card } from "./card";
import { runTests as RunTests } from "./tests";
import { Mana } from "./mana";

import "./site.css";
import { Land } from "./land";

const mainDiv = document.getElementById('main') as HTMLDivElement;
const simulatedGamesInput = document.getElementById('simulatedGames') as HTMLInputElement;

function Initialize() {
    console.log("hi");
    mainDiv.innerText += "hi hi";
    RunTests();
    GetOpeningHandStats();
}

function GetOpeningHandStats() {
    let num = Math.floor(parseFloat(simulatedGamesInput.value));
    let lands = Array(20).fill(new Land("Swamp", Mana.Black));
    let cards = Array(40).fill(new Card("Dark Ritual", [Mana.Black]));
    let deck = [...lands, ...cards];
    let state = GameState.CreateWithDeck(deck);
    let landNumbers = Array(8).fill(0);
    for (let i = 0; i < num; i++) {
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
    let result = "";
    for (let i = 0; i < landNumbers.length; i++) {
        result += "Chance to start with " + i + " lands: " + (100*landNumbers[i]/num).toFixed(2) + "%\n";
    }
    mainDiv.innerText = result;
    console.log(result);
}

Initialize();
