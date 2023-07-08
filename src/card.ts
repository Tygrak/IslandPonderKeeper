import { Mana } from "./mana";
import { IsCastable } from "./rules";

export class Card {
    name: string;
    manaCost: Mana[];
    typeLine: string = "";

    constructor (name: string, manaCost: Mana[]) {
        this.name = name;
        this.manaCost = [...manaCost].sort((a, b) => a - b);
    }

    public IsCastable(availableMana: Mana[]) {
        return IsCastable(availableMana, this.manaCost);
    }

    public IsType(type: string) {
        return this.typeLine.indexOf(type) != -1;
    }
}