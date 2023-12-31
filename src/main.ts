import "./site.css";

import { GameState } from "./GameState";
import { Card } from "./card";
import { RunTests } from "./tests";
import { Mana } from "./mana";
import { Land } from "./land";
import { CleanDatabase, GetDeckPrettyString, LoadDatabase, LoadFile, ParseManacostScryfall, ReadDeckData, ReadDeckDekData } from "./deckImport";
import { CheckRuleManaProduction, CheckRuleMatchesAllCards, CheckRuleMatchesAnyCard, CheckRuleHasCastableCards, CheckRuleHasCardsOfType, CastabilityRequirement, CheckRuleLandCount, Rule, ManaProductionRule, AnyCardRule, LandsNumberRule, CastableCardsRule, AllCardRule, RequiredTypesRule, AndRule, OrRule } from "./rules";

const resultsDiv = document.getElementById('results') as HTMLDivElement;
const deckInput = document.getElementById('deckInput') as HTMLTextAreaElement;
const deckLoadFileInput = document.getElementById('deckLoadFileInput') as HTMLInputElement;

const simulatedGamesInput = document.getElementById('simulatedGames') as HTMLInputElement;

const runSimulationButton = document.getElementById('runSimulation') as HTMLButtonElement;
const importDeckButton = document.getElementById('importDeck') as HTMLButtonElement;
const deckLoadButton = document.getElementById('deckLoadButton') as HTMLButtonElement;
const clearRulesButton = document.getElementById('clearRulesButton') as HTMLButtonElement;
const rulesDiv: HTMLDivElement = document.getElementById("rules") as HTMLDivElement;

let deck: Card[] = [];
let currentRules: Rule[] = [];

function Initialize() {
    resultsDiv.innerText = "Loading";
    //CleanDatabase();
    LoadDatabase();
    RunTests();
    currentRules.push(new LandsNumberRule(null));
    currentRules.push(new ManaProductionRule(null));
    currentRules.push(new CastableCardsRule(null));
    currentRules.push(new RequiredTypesRule(null));
    currentRules.push(new AnyCardRule(null));
    currentRules.push(new AllCardRule(null));
    currentRules.push(new OrRule(null));
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
            for (let i = 0; i < currentRules.length; i++) {
                matchesRules = matchesRules && currentRules[i].Evaluate(state);
            }
            if (matchesRules) {
                if (exampleHands.length < 5) {
                    exampleHands.push("Keep: "+state.hand.map(c => c.name).join(", "));
                }
                matchesKeepRules[state.hand.length]++;
                break;
            } else if (exampleHands.length < 5 && state.hand.length >= 6) {
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
    result += "Total chance to match keep rules: " + (100*sumKeep).toFixed(2) + "%\n";
    result += "Total chance to NOT match keep rules: " + (100*(1-sumKeep)).toFixed(2) + "%\n";
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

clearRulesButton.onclick = (ev) => {
    currentRules = [];
    rulesDiv.innerHTML = "";
    currentRules.push(new AndRule(null));
};
