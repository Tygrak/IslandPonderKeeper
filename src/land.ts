import { Card } from "./card";
import { Mana } from "./mana";
import { Permanent } from "./permanent";

export class Land extends Permanent {
    produces: Mana;

    constructor (name: string, produces: Mana) {
        super(name, []);
        this.produces = produces;
        this.typeLine = "Land";
    }
}