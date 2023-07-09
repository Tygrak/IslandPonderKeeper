import { Card } from "./card";
import { Mana } from "./mana";

export class Ritual extends Card {
    produces: Mana[];

    constructor (name: string, cost: Mana[], produces: Mana[]) {
        super(name, cost);
        this.produces = produces;
    }
}