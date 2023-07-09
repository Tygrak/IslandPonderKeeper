import { GameState } from "./GameState";
import { ParseManacostScryfall } from "./deckImport";
import { Land } from "./land";
import { IsCastable, Mana, RemoveManaForCast } from "./mana";
import { Ritual } from "./ritual";

export enum CastabilityRequirement {
    None,
    CastableWithLands,
    CastableWithRituals,
    CastableWithRitualsT1
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

export function CheckRuleMatchesAnyCard(gameState: GameState, requiredCardsInput: string, castability: CastabilityRequirement = CastabilityRequirement.None) {
    let requiredCards = requiredCardsInput.split("|");
    requiredCards = requiredCards.map(s => s.trim());
    requiredCards = requiredCards.filter(s => s != "");
    if (requiredCards.length == 0) {
        return true;
    }
    for (let i = 0; i < requiredCards.length; i++) {
        if (castability == CastabilityRequirement.None && gameState.hand.findIndex(c => c.name == requiredCards[i]) != -1) {
            if (gameState.hand.findIndex(c => c.name == requiredCards[i]) != -1) {
                return true;
            }
        } else if (castability == CastabilityRequirement.CastableWithLands) {
            if (gameState.hand.findIndex(c => c.name == requiredCards[i] && c.IsCastable(gameState.AvailableManaInHand())) != -1) {
                return true;
            }
        } else if (castability == CastabilityRequirement.CastableWithRituals) {
            if (gameState.hand.findIndex(c => c.name == requiredCards[i] && IsCastableWithRituals(gameState, c.manaCost)) != -1) {
                return true;
            }
        } else if (castability == CastabilityRequirement.CastableWithRitualsT1) {
            if (gameState.hand.findIndex(c => c.name == requiredCards[i] && IsCastableWithRitualsT1(gameState, c.manaCost)) != -1) {
                return true;
            }
        }
    }
    return false;
}

export function CheckRuleMatchesAllCards(gameState: GameState, requiredCardsInput: string, castability: CastabilityRequirement = CastabilityRequirement.None) {
    let requiredCards = requiredCardsInput.split("|");
    requiredCards = requiredCards.map(s => s.trim());
    requiredCards = requiredCards.filter(s => s != "");
    if (requiredCards.length == 0) {
        return true;
    }
    let handCopy = [...gameState.hand];
    for (let i = requiredCards.length-1; i >= 0; i--) {
        let cardsWithNameIndexes = handCopy.map((c, index) => c.name == requiredCards[i] ? index : -1).filter(i => i != -1);
        if (cardsWithNameIndexes.length == 0) {
            return false;
        }
        let found = -1;
        if (castability == CastabilityRequirement.None) {
            found = cardsWithNameIndexes[0];
        } else {
            for (let j = 0; j < cardsWithNameIndexes.length; j++) {
                const index = cardsWithNameIndexes[j];
                if (castability == CastabilityRequirement.CastableWithLands && handCopy[index].IsCastable(gameState.AvailableManaInHand())) {
                    found = index;
                    break;
                } else if (castability == CastabilityRequirement.CastableWithRituals && IsCastableWithRituals(gameState, handCopy[index].manaCost)) {
                    found = index;
                    break;
                } else if (castability == CastabilityRequirement.CastableWithRitualsT1 && IsCastableWithRitualsT1(gameState, handCopy[index].manaCost)) {
                    found = index;
                    break;
                }
            }
        }
        if (found == -1) {
            return false;
        }
        handCopy.splice(found, 1);
    }
    return true;
}

export function CheckRuleHasCardsOfType(gameState: GameState, requiredTypesInput: string, castability: CastabilityRequirement = CastabilityRequirement.None) {
    let requiredTypes = requiredTypesInput.split(/[,;|]/);
    requiredTypes = requiredTypes.map(s => s.trim());
    requiredTypes = requiredTypes.filter(s => s != "");
    if (requiredTypes.length == 0) {
        return true;
    }
    let handCopy = [...gameState.hand];
    for (let i = requiredTypes.length-1; i >= 0; i--) {
        let cardsOfTypeIndexes = handCopy.map((c, index) => c.IsType(requiredTypes[i]) ? index : -1).filter(i => i != -1);
        if (cardsOfTypeIndexes.length == 0) {
            return false;
        }
        let found = -1;
        if (castability == CastabilityRequirement.None) {
            found = cardsOfTypeIndexes[0];
        } else {
            for (let j = 0; j < cardsOfTypeIndexes.length; j++) {
                const index = cardsOfTypeIndexes[j];
                if (castability == CastabilityRequirement.CastableWithLands && handCopy[index].IsCastable(gameState.AvailableManaInHand())) {
                    found = index;
                    break;
                } else if (castability == CastabilityRequirement.CastableWithRituals && IsCastableWithRituals(gameState, handCopy[index].manaCost)) {
                    found = index;
                    break;
                } else if (castability == CastabilityRequirement.CastableWithRitualsT1 && IsCastableWithRitualsT1(gameState, handCopy[index].manaCost)) {
                    found = index;
                    break;
                }
            }
        }
        if (found == -1) {
            return false;
        }
        handCopy.splice(found, 1);
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

export function IsCastableWithRituals(gameState: GameState, manaCost: Mana[]) {
    let mana: Mana[] = [];
    for (let i = 0; i < gameState.hand.length; i++) {
        const card = gameState.hand[i];
        if (card instanceof Land && !(card.enteredThisTurn && card.entersTapped)) {
            mana.push(card.produces);
        }
    }
    let rituals = gameState.hand.filter(c => c instanceof Ritual).map(c => c as Ritual);
    rituals = rituals.sort((a, b) => a.manaCost.length-b.manaCost.length);
    return IsCastableWithBaseManaAndRituals(manaCost, rituals, mana);
}

export function IsCastableWithRitualsT1(gameState: GameState, manaCost: Mana[]) {
    let rituals = gameState.hand.filter(c => c instanceof Ritual).map(c => c as Ritual);
    rituals = rituals.sort((a, b) => a.manaCost.length-b.manaCost.length);
    for (let i = 0; i < gameState.hand.length; i++) {
        const card = gameState.hand[i];
        if (card instanceof Land && !card.entersTapped && IsCastableWithBaseManaAndRituals(manaCost, rituals, [card.produces])) {
            return true;
        }
    }
    if (IsCastableWithBaseManaAndRituals(manaCost, rituals, [])) {
        return true;
    }
    return false;
}

function IsCastableWithBaseManaAndRituals(manaCost: Mana[], rituals: Ritual[], availableMana: Mana[]) {
    if (IsCastable(availableMana, manaCost)) {
        return true;
    }
    for (let i = 0; i < rituals.length; i++) {
        const ritual = rituals[i];
        if (ritual.IsCastable(availableMana)) {
            let manaCopy = [...availableMana];
            manaCopy = RemoveManaForCast(manaCopy, ritual.manaCost);
            manaCopy.push(...ritual.produces);
            let ritualsCopy = [...rituals];
            ritualsCopy.splice(i, 1);
            if (IsCastableWithBaseManaAndRituals(manaCost, ritualsCopy, manaCopy)) {
                return true;
            }
        }
    }
    return false;
}
