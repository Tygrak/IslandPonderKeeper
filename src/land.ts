import { Card } from "./card";
import { Mana } from "./mana";

export class Land extends Card {
    produces: Mana;

    constructor (name: string, produces: Mana) {
        super(name, []);
        this.produces = produces;
    }
}