import { GameState } from "./GameState";
import { CastabilityRequirementElement } from "./castabilityRadioElement";
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

export enum RuleType {
    ManaProduction,
    AnyCardFrom,
    AllCardsFrom,
    CardOfType,
    LandCount,
    Or,
    And
}

let globalNameIdCounter = 1;

export class Rule {
    div: HTMLDivElement;
    subRules: Rule[] = [];
    parent: Rule | null = null;

    constructor (parent: Rule | null) {
        this.parent = parent;
        this.div = this.CreateDivElement();
    }

    private CreateDivElement() {
        let parentDiv: HTMLDivElement = document.getElementById("rules") as HTMLDivElement;
        if (this.parent != null) {
            parentDiv = this.parent.div!;
        }
        this.div = document.createElement('div');
        this.div.classList.add("rule");
        parentDiv.appendChild(this.div);
        return this.div;
    }

    public Evaluate(gameState: GameState) {
        return true;
    }
}

export class ManaProductionRule extends Rule {
    label: HTMLLabelElement;
    input: HTMLInputElement;

    constructor (parent: Rule | null) {
        super(parent);
        this.input = document.createElement('input');
        this.input.type = "text";
        this.input.name = GetUniqueInputName();
        this.label = document.createElement('label');
        this.label.innerText = "Can Produce Mana (symbols WUBRG, split with /[,;|]/)";
        this.label.htmlFor = this.input.name;
        this.div.appendChild(this.input);
        this.div.appendChild(this.label);
    }

    public Evaluate(gameState: GameState) {
        return CheckRuleManaProduction(gameState, this.input.value);
    }
}

export class AnyCardRule extends Rule {
    label: HTMLLabelElement;
    input: HTMLInputElement;
    castabilityElement: CastabilityRequirementElement;

    constructor (parent: Rule | null) {
        super(parent);
        this.castabilityElement = new CastabilityRequirementElement(this.div);
        this.input = document.createElement('input');
        this.input.type = "text";
        this.input.name = GetUniqueInputName();
        this.label = document.createElement('label');
        this.label.innerText = "Required Cards for Keep (any, split with |)";
        this.label.htmlFor = this.input.name;
        this.div.appendChild(this.input);
        this.div.appendChild(this.label);
    }

    public Evaluate(gameState: GameState) {
        return CheckRuleMatchesAnyCard(gameState, this.input.value, this.castabilityElement.GetValue());
    }
}

export class AllCardRule extends Rule {
    label: HTMLLabelElement;
    input: HTMLInputElement;
    castabilityElement: CastabilityRequirementElement;

    constructor (parent: Rule | null) {
        super(parent);
        this.castabilityElement = new CastabilityRequirementElement(this.div);
        this.input = document.createElement('input');
        this.input.type = "text";
        this.input.name = GetUniqueInputName();
        this.label = document.createElement('label');
        this.label.innerText = "Required Cards for Keep (all, split with |)";
        this.label.htmlFor = this.input.name;
        this.div.appendChild(this.input);
        this.div.appendChild(this.label);
    }

    public Evaluate(gameState: GameState) {
        return CheckRuleMatchesAllCards(gameState, this.input.value, this.castabilityElement.GetValue());
    }
}

export class RequiredTypesRule extends Rule {
    label: HTMLLabelElement;
    input: HTMLInputElement;
    castabilityElement: CastabilityRequirementElement;

    constructor (parent: Rule | null) {
        super(parent);
        this.castabilityElement = new CastabilityRequirementElement(this.div);
        this.input = document.createElement('input');
        this.input.type = "text";
        this.input.name = GetUniqueInputName();
        this.label = document.createElement('label');
        this.label.innerText = "Required Card Types in Hand (split with /[,;|]/)";
        this.label.htmlFor = this.input.name;
        this.div.appendChild(this.input);
        this.div.appendChild(this.label);
    }

    public Evaluate(gameState: GameState) {
        return CheckRuleHasCardsOfType(gameState, this.input.value, this.castabilityElement.GetValue());
    }
}

export class CastableCardsRule extends Rule {
    label: HTMLLabelElement;
    input: HTMLInputElement;

    constructor (parent: Rule | null) {
        super(parent);
        this.input = document.createElement('input');
        this.input.type = "number";
        this.input.value = "1";
        this.input.min = "0";
        this.input.max = "7";
        this.input.name = GetUniqueInputName();
        this.label = document.createElement('label');
        this.label.innerText = "Number of Wanted Castable Cards";
        this.label.htmlFor = this.input.name;
        this.div.appendChild(this.input);
        this.div.appendChild(this.label);
    }

    public Evaluate(gameState: GameState) {
        return CheckRuleHasCastableCards(gameState, parseInt(this.input.value));
    }
}

export class LandsNumberRule extends Rule {
    labelMin: HTMLLabelElement;
    labelMax: HTMLLabelElement;
    inputMin: HTMLInputElement;
    inputMax: HTMLInputElement;

    constructor (parent: Rule | null) {
        super(parent);
        this.inputMin = document.createElement('input');
        this.inputMin.type = "number";
        this.inputMin.value = "1";
        this.inputMin.min = "0";
        this.inputMin.max = "7";
        this.inputMin.name = GetUniqueInputName();
        this.labelMin = document.createElement('label');
        this.labelMin.innerText = "Minimum Lands for Keep";
        this.labelMin.htmlFor = this.inputMin.name;
        this.div.appendChild(this.inputMin);
        this.div.appendChild(this.labelMin);
        this.inputMax = document.createElement('input');
        this.inputMax.type = "number";
        this.inputMax.value = "5";
        this.inputMax.min = "0";
        this.inputMax.max = "7";
        this.inputMax.name = GetUniqueInputName();
        this.labelMax = document.createElement('label');
        this.labelMax.innerText = "Maximum Lands for Keep";
        this.labelMax.htmlFor = this.inputMax.name;
        this.div.appendChild(this.inputMax);
        this.div.appendChild(this.labelMax);
    }

    public Evaluate(gameState: GameState) {
        return CheckRuleLandCount(gameState, parseInt(this.inputMin.value), parseInt(this.inputMax.value));
    }
}

function GetUniqueInputName() {
    let name = "ruleinput-"+globalNameIdCounter;
    globalNameIdCounter++;
    return name;
}

export function CheckRuleLandCount(gameState: GameState, minLands: number, maxLands: number) {
    let lands = gameState.CountLandsInHand();
    return lands >= minLands && lands <= maxLands;
}

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
