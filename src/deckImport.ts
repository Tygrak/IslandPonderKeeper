import { Card } from "./card";


export function ReadDeckData(dataString: string) {
    let deck: Card[] = [];
    let lines = dataString.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.trim();
        let match = line.match(/(\d+)\s+(.+)/);
        if (match != null) {
            const number = parseInt(match[1]);
            const name = match[2];
            for (let n = 0; n < number; n++) {
                //todo read from scryfall data
                deck.push(new Card(name, []));
            }
        }
    }
    return deck;
}