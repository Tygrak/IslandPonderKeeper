import { Card } from "./card";
import { Mana } from "./mana";

export function RunTests() {
    let mana = [Mana.White, Mana.Green, Mana.Red, Mana.Red];
    let card1 = new Card("1", [Mana.White]);
    console.assert(card1.IsCastable(mana));
    let card2 = new Card("2", [Mana.Red, Mana.Colorless, Mana.Red]);
    console.assert(card2.IsCastable(mana));
    let card3 = new Card("3", [Mana.Red, Mana.Colorless, Mana.Red]);
    console.assert(card3.IsCastable(mana));
    let card4 = new Card("4", [Mana.Red, Mana.Colorless, Mana.Red, Mana.Green]);
    console.assert(card4.IsCastable(mana));
    let card5 = new Card("5", [Mana.Colorless]);
    console.assert(card5.IsCastable(mana));
    let card6 = new Card("6", [Mana.Colorless, Mana.Colorless, Mana.White, Mana.Colorless]);
    console.assert(card6.IsCastable(mana));
    let cardUncastable1 = new Card("uncastable1", [Mana.Blue]);
    console.assert(!cardUncastable1.IsCastable(mana));
    let cardUncastable2 = new Card("uncastable2", [Mana.Red, Mana.Red, Mana.Red]);
    console.assert(!cardUncastable2.IsCastable(mana));
    let cardUncastable3 = new Card("uncastable3", [Mana.Colorless, Mana.Colorless, Mana.Colorless, Mana.Colorless, Mana.Colorless]);
    console.assert(!cardUncastable3.IsCastable(mana));
    console.log("tests finished successfully!!!");
}