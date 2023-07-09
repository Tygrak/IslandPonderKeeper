import "./site.css";

import { GameState } from "./GameState";
import { Card } from "./card";
import { RunTests } from "./tests";
import { Mana } from "./mana";
import { Land } from "./land";
import { CleanDatabase, GetDeckPrettyString, LoadDatabase, LoadFile, ParseManacostScryfall, ReadDeckData, ReadDeckDekData } from "./deckImport";
import { IsCastable, CheckRuleManaProduction, CheckRuleMatchesAllCards, CheckRuleMatchesAnyCard, CheckRuleHasCastableCards, CheckRuleHasCardsOfType } from "./rules";

const resultsDiv = document.getElementById('results') as HTMLDivElement;
const deckInput = document.getElementById('deckInput') as HTMLTextAreaElement;
const deckLoadFileInput = document.getElementById('deckLoadFileInput') as HTMLInputElement;

const simulatedGamesInput = document.getElementById('simulatedGames') as HTMLInputElement;
const minWantedLandsInput = document.getElementById('minWantedLands') as HTMLInputElement;
const maxWantedLandsInput = document.getElementById('maxWantedLands') as HTMLInputElement;
const requiredCardsAnyInput = document.getElementById('requiredCardsAny') as HTMLInputElement;
const requiredCardsAllInput = document.getElementById('requiredCardsAll') as HTMLInputElement;
const wantedAvailableManaInput = document.getElementById('wantedAvailableMana') as HTMLInputElement;
const wantedCastableCardsInput = document.getElementById('wantedCastableCards') as HTMLInputElement;
const wantedTypesInput = document.getElementById('wantedTypes') as HTMLInputElement;

const runSimulationButton = document.getElementById('runSimulation') as HTMLButtonElement;
const importDeckButton = document.getElementById('importDeck') as HTMLButtonElement;
const deckLoadButton = document.getElementById('deckLoadButton') as HTMLButtonElement;

let deck: Card[] = [];

function Initialize() {
    resultsDiv.innerText = "Loading";
    //CleanDatabase();
    LoadDatabase();
    RunTests();
    if (deckInput.value.length > 5) {
        ImportDeck();
    }
    resultsDiv.innerText = "Ready -- Import a deck and click \"Run Simulation\" to begin";
    //CreateBaseDeck();
    //GetOpeningHandStats();
}

function CreateBaseDeck() {
    let lands = Array(20).fill(new Land("Swamp", Mana.Black));
    let cards = Array(40).fill(new Card("Dark Ritual", [Mana.Black]));
    deck = [...lands, ...cards];
}

function GetOpeningHandStats(withMulligans: boolean = false) {
    if (deck.length == 0) {
        resultsDiv.innerText = "Please import a deck";
        return;
    }
    let num = parseInt(simulatedGamesInput.value);
    let minLands = parseInt(minWantedLandsInput.value);
    let maxLands = parseInt(maxWantedLandsInput.value);
    let wantedCastableCards = parseInt(wantedCastableCardsInput.value);

    let state = GameState.CreateWithDeck(deck);

    let landNumbers = Array(8).fill(0);
    let matchesKeepRules = Array(8).fill(0);
    let exampleHands: string[] = [];

    console.log("Starting simulations");
    for (let i = 0; i <= num; i++) {
        if (i > 0 && i%5000 == 0) {
            let message = i + " simulations finished";
            resultsDiv.innerText = message;
            console.log(message);
        }
        state.ShuffleHandToDeck();
        state.DrawCard(7);
        let landNumber = state.CountLandsInHand();
        landNumbers[landNumber]++;
        while (state.hand.length > 0) {
            let matchesRules = true;
            matchesRules = matchesRules && landNumber >= minLands && landNumber <= maxLands;
            matchesRules = matchesRules && CheckRuleMatchesAllCards(state, requiredCardsAllInput.value);
            matchesRules = matchesRules && CheckRuleMatchesAnyCard(state, requiredCardsAnyInput.value);
            matchesRules = matchesRules && CheckRuleManaProduction(state, wantedAvailableManaInput.value);
            matchesRules = matchesRules && CheckRuleHasCastableCards(state, wantedCastableCards);
            matchesRules = matchesRules && CheckRuleHasCardsOfType(state, wantedTypesInput.value);
            if (matchesRules) {
                if (exampleHands.length < 5) {
                    exampleHands.push("Keep: "+state.hand.map(c => c.name).join(", "));
                }
                matchesKeepRules[state.hand.length]++;
                break;
            } else if (exampleHands.length < 5) {
                exampleHands.push("Mull: "+state.hand.map(c => c.name).join(", "));
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
    result += "\n\nExample hands:\n" + exampleHands.join("\n") + "\n";
    resultsDiv.innerText = result;
    console.log(result);
}

function ImportDeck() {
    deck = ReadDeckData(deckInput.value);
    console.log("Imported deck data");
    deckInput.value = GetDeckPrettyString(deck);
}

Initialize();

runSimulationButton.onclick = (ev) => {GetOpeningHandStats();};
importDeckButton.onclick = (ev) => {
    ImportDeck();
};
deckLoadButton.onclick = (ev) => {
    if (deckLoadFileInput.files != null && deckLoadFileInput.files.length > 0) {
        LoadFile(deckLoadFileInput.files[0], (s: string) => {
            deck = ReadDeckDekData(s);
            if (deck.length == 0) {
                deck = ReadDeckData(s);
            }
            console.log("Imported deck data from file " + deckLoadFileInput.files![0].name);
            deckInput.value = GetDeckPrettyString(deck);
        });
    }
};
