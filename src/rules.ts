import { GameState } from "./GameState";
import { ParseManacostScryfall } from "./deckImport";
import { Land } from "./land";
import { Mana } from "./mana";

export function IsCastable(availableMana: Mana[], manaCost: Mana[]) {
    let available = [...availableMana];
    let cost = [...manaCost];
    for (let i = cost.length-1; i >= 0; i--) {
        let id = available.findIndex(m => m == cost[i]);
        if (id == -1) {
            if (cost[i] == Mana.Colorless) {
                id = 0;
            } else {
                id = available.findIndex(m => (m & cost[i]) > 0);
            }
        }
        if (id == -1 || available.length == 0) {
            return false;
        }
        cost.splice(i, 1);
        available.splice(id, 1);
    }
    return true;
}

//todo: keep rules through custom condition trees
export function CheckRuleManaProduction(gameState: GameState, wantedAvailableMana: string) {
    wantedAvailableMana = wantedAvailableMana.trim();
    if (wantedAvailableMana == "") {
        return true;
    }
    let manaCost: Mana[] = [];
    if (wantedAvailableMana.indexOf("{") != -1) {
        manaCost = ParseManacostScryfall(wantedAvailableMana)
    } else {
        let requiredMana = wantedAvailableMana.split(/[,;|]/);
        requiredMana = requiredMana.map(s => s.trim());
        requiredMana = requiredMana.filter(s => s != "");
        for (let i = 0; i < requiredMana.length; i++) {
            if (requiredMana[i].match(/\d+/)) {
                let num = parseInt(requiredMana[i]);
                for (let i = 0; i < num; i++) {
                    manaCost.push(Mana.Colorless);
                }
            } else {
                let mana: Mana = Mana.Colorless;
                if (requiredMana[i].indexOf("W") != -1) {
                    mana = mana|Mana.White;
                }
                if (requiredMana[i].indexOf("U") != -1) {
                    mana = mana|Mana.Blue;
                }
                if (requiredMana[i].indexOf("B") != -1) {
                    mana = mana|Mana.Black;
                }
                if (requiredMana[i].indexOf("R") != -1) {
                    mana = mana|Mana.Red;
                }
                if (requiredMana[i].indexOf("G") != -1) {
                    mana = mana|Mana.Green;
                }
                manaCost.push(mana);
            }
        }
    }
    let availableMana = gameState.AvailableManaInHand();
    return IsCastable(availableMana, manaCost);
}

export function CheckRuleMatchesAnyCard(gameState: GameState, requiredCardsInput: string) {
    let requiredCards = requiredCardsInput.split("|");
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

export function CheckRuleMatchesAllCards(gameState: GameState, requiredCardsInput: string) {
    let requiredCards = requiredCardsInput.split("|");
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

export function CheckRuleHasCardsOfType(gameState: GameState, requiredTypesInput: string) {
    let requiredTypes = requiredTypesInput.split(/[,;|]/);
    requiredTypes = requiredTypes.map(s => s.trim());
    requiredTypes = requiredTypes.filter(s => s != "");
    if (requiredTypes.length == 0) {
        return true;
    }
    let handCopy = [...gameState.hand];
    for (let i = requiredTypes.length-1; i >= 0; i--) {
        let index = handCopy.findIndex(c => c.IsType(requiredTypes[i]));
        if (index == -1) {
            return false;
        }
        handCopy.splice(index, 1);
    }
    return true;
}

export function CheckRuleHasCastableCards(gameState: GameState, amount: number) {
    if (amount == 0) {
        return true;
    }
    let availableMana = gameState.AvailableManaInHand();
    let castable = 0;
    for (let i = 0; i < gameState.hand.length; i++) {
        if (!(gameState.hand[i] instanceof Land) && gameState.hand[i].IsCastable(availableMana)) {
            castable++;
        }
    }
    return castable >= amount;
}

