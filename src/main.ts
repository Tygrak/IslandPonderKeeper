import "./site.css";

import { GameState } from "./GameState";
import { Card } from "./card";
import { RunTests } from "./tests";
import { Mana } from "./mana";
import { Land } from "./land";
import { CleanDatabase, LoadDatabase, ReadDeckData } from "./deckImport";

const resultsDiv = document.getElementById('results') as HTMLDivElement;
const deckInput = document.getElementById('deckInput') as HTMLTextAreaElement;

const simulatedGamesInput = document.getElementById('simulatedGames') as HTMLInputElement;
const minWantedLandsInput = document.getElementById('minWantedLands') as HTMLInputElement;
const maxWantedLandsInput = document.getElementById('maxWantedLands') as HTMLInputElement;
const requiredCardsAnyInput = document.getElementById('requiredCardsAny') as HTMLInputElement;
const requiredCardsAllInput = document.getElementById('requiredCardsAll') as HTMLInputElement;

const runSimulationButton = document.getElementById('runSimulation') as HTMLButtonElement;
const importDeckButton = document.getElementById('importDeck') as HTMLButtonElement;

let deck: Card[] = [];

function Initialize() {
    resultsDiv.innerText = "Loading";
    //CleanDatabase();
    LoadDatabase();
    RunTests();
    CreateBaseDeck();
    GetOpeningHandStats();
}

function CreateBaseDeck() {
    let lands = Array(20).fill(new Land("Swamp", Mana.Black));
    let cards = Array(40).fill(new Card("Dark Ritual", [Mana.Black]));
    deck = [...lands, ...cards];
}

function GetOpeningHandStats(withMulligans: boolean = false) {
    let num = parseInt(simulatedGamesInput.value);
    let minLands = parseInt(minWantedLandsInput.value);
    let maxLands = parseInt(maxWantedLandsInput.value);

    let state = GameState.CreateWithDeck(deck);
    let landNumbers = Array(8).fill(0);
    let matchesKeepRules = Array(8).fill(0);
    console.log("Starting simulations");
    for (let i = 0; i < num; i++) {
        if (i > 0 && i%1000 == 0) {
            let message = i + " simulations finished";
            resultsDiv.innerText = message;
            console.log(message);
        }
        state.ShuffleHandToDeck();
        state.DrawCard(7);
        let landNumber = state.CountLandsInHand();
        landNumbers[landNumber]++;
        while (state.hand.length > 0) {
            if (landNumber >= minLands && landNumber <= maxLands && ParseMatchesAllCards(state) && ParseMatchesAnyCard(state)) {
                matchesKeepRules[state.hand.length]++;
                break;
            }
            //todo: london mulligan
            let cards = state.hand.length-1;
            state.ShuffleHandToDeck();
            state.DrawCard(cards);
            landNumber = state.CountLandsInHand();
        }
    }
    state.ShuffleHandToDeck();
    let result = "";
    for (let i = 0; i < landNumbers.length; i++) {
        result += "Chance to start with " + i + " lands: " + (100*landNumbers[i]/num).toFixed(2) + "%\n";
    }
    result += "\n";
    let sumKeep = 0;
    for (let cards = 7; cards >= 4; cards--) {
        sumKeep += matchesKeepRules[cards]/num;
        result += "Chance to match keep rules (" + cards + " card hand): " + (100*matchesKeepRules[cards]/num).toFixed(2) + "%\n";
    }
    result += "Chance to NOT match keep rules: " + (100*(1-sumKeep)).toFixed(2) + "%\n";
    let averageKeep = 0;
    for (let i = 1; i < matchesKeepRules.length; i++) {
        averageKeep += matchesKeepRules[i]*i;
    }
    averageKeep = averageKeep/num;
    result += "Average keep hand size: " + averageKeep.toFixed(2) + "\n";
    resultsDiv.innerText = result;
    console.log(result);
}

//todo: keep rules through custom condition trees
function ParseMatchesAnyCard(gameState: GameState) {
    let requiredCards = requiredCardsAnyInput.value.split("|");
    requiredCards = requiredCards.map(s => s.trim());
    requiredCards = requiredCards.filter(s => s != "");
    if (requiredCards.length == 0) {
        return true;
    }
    for (let i = 0; i < gameState.hand.length; i++) {
        if (requiredCards.indexOf(gameState.hand[i].name) != -1) {
            return true;
        }
    }
    return false;
}

function ParseMatchesAllCards(gameState: GameState) {
    let requiredCards = requiredCardsAllInput.value.split("|");
    requiredCards = requiredCards.map(s => s.trim());
    requiredCards = requiredCards.filter(s => s != "");
    if (requiredCards.length == 0) {
        return true;
    }
    let handCopy = [...gameState.hand];
    for (let i = requiredCards.length-1; i >= 0; i--) {
        let index = handCopy.findIndex(c => c.name == requiredCards[i]);
        if (index == -1) {
            return false;
        }
        handCopy.splice(index, 1);
    }
    return true;
}

Initialize();

runSimulationButton.onclick = (ev) => {GetOpeningHandStats();};
importDeckButton.onclick = (ev) => {
    deck = ReadDeckData(deckInput.value);
    console.log("Imported deck data");
};
