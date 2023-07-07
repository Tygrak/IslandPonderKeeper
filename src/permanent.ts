import { Card } from "./card";
import { Mana } from "./mana";

export class Permanent extends Card {
    entersTapped: boolean = false;
    enteredThisTurn: boolean = true;

    constructor (name: string, manaCost: Mana[]) {
        super(name, manaCost);
    }
}