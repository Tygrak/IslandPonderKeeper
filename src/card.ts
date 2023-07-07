import { Mana } from "./mana";

export class Card {
    name: string;
    manaCost: Mana[];

    constructor (name: string, manaCost: Mana[]) {
        this.name = name;
        this.manaCost = [...manaCost].sort((a, b) => a - b);
    }

    public IsCastable(availableMana: Mana[]) {
        let available = [...availableMana];
        let cost = [...this.manaCost];
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
}