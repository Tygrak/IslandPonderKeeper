import { GameState } from "./GameState";
import { Land } from "./land";

export enum Mana {
    Colorless = 0,
    White = (1 << 0),
    Blue = (1 << 1),
    Black = (1 << 2),
    Red = (1 << 3),
    Green = (1 << 4),
    Rainbow = White|Blue|Black|Red|Green,
}

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

export function RemoveManaForCast(availableMana: Mana[], manaCost: Mana[]) {
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
            console.error("Tried to remove mana for castting spell that is uncastable");
        }
        cost.splice(i, 1);
        available.splice(id, 1);
    }
    return available;
}
