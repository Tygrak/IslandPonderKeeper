import { Card } from "./card";
import { Land } from "./land";
import { Mana } from "./mana";

const cardDatabase = require("./data/database.json");
let loaded = false;
let database: any = {};

export function CleanDatabase() {
    /*const largeDatabase = require("./data/oracle-cards.json");
    database = JSON.parse(largeDatabase);
    let cleaned: any = {};
    for (let i = 0; i < database.length; i++) {
        const element = database[i];
        let img = element["image_uris"] === undefined ? "" : element["image_uris"]["small"];
        let card = {"name": element["name"], "type_line": element["type_line"], 
                    "toughness": element["toughness"], "power": element["power"],
                    "mana_cost": element["mana_cost"], "cmc": element["cmc"],
                    "produced_mana": element["produced_mana"], "keywords": element["keywords"],
                    "oracle_text": element["oracle_text"],
                    "image": img};
        cleaned[element["name"]] = card;
    }
    console.log(database.length);
    SaveFile("database.json", JSON.stringify(cleaned, null, "\t"));*/
}

function SaveFile(filename: string, data: string) {
    const blob = new Blob([data], {type: 'text/csv'});
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;        
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
}

export function LoadDatabase() {
    if (loaded) {
        return;
    }
    database = JSON.parse(cardDatabase);
    console.log(database.length);
    loaded = true;
}

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
                deck.push(CreateCardFromDatabase(name));
            }
        }
    }
    return deck;
}

export function CreateCardFromDatabase(name: string) {
    if (!loaded) {
        LoadDatabase();
    }
    let data = database[name];
    let card: Card;
    if (data === undefined) {
        //todo add some error printing to site
        console.error(name + " - not found in database!");
        return new Card(name, []);
    }
    let type_line: string = data["type_line"];
    let mana_cost: string = data["mana_cost"];
    let cost: Mana[] = ParseManacost(mana_cost);
    if (type_line !== undefined && type_line.indexOf("Land") != -1) {
        let produced_mana: string[] = data["produced_mana"];
        card = new Land(name, ParseProducedMana(produced_mana));
    } else {
        card = new Card(name, cost);
    }
    card.typeLine = type_line;
    return card;
}

export function ParseManacost(mana_cost: string) {
    let cost: Mana[] = [];
    let matches = mana_cost.matchAll(/{(.+?)}/g);
    for (const match of matches) {
        if (match[1].match(/\d+/)) {
            let num = parseInt(match[1]);
            for (let i = 0; i < num; i++) {
                cost.push(Mana.Colorless);
            }
        } else {
            let mana: Mana = Mana.Colorless;
            if (match[1].indexOf("W") != -1) {
                mana = mana|Mana.White;
            }
            if (match[1].indexOf("U") != -1) {
                mana = mana|Mana.Blue;
            }
            if (match[1].indexOf("B") != -1) {
                mana = mana|Mana.Black;
            }
            if (match[1].indexOf("R") != -1) {
                mana = mana|Mana.Red;
            }
            if (match[1].indexOf("G") != -1) {
                mana = mana|Mana.Green;
            }
            cost.push(mana);
        }
    }
    return cost;
}

export function ParseProducedMana(produced_mana: string[]) {
    let mana: Mana = Mana.Colorless;
    for (let i = 0; i < produced_mana.length; i++) {
        if (produced_mana[i].indexOf("W") != -1) {
            mana = mana|Mana.White;
        }
        if (produced_mana[i].indexOf("U") != -1) {
            mana = mana|Mana.Blue;
        }
        if (produced_mana[i].indexOf("B") != -1) {
            mana = mana|Mana.Black;
        }
        if (produced_mana[i].indexOf("R") != -1) {
            mana = mana|Mana.Red;
        }
        if (produced_mana[i].indexOf("G") != -1) {
            mana = mana|Mana.Green;
        }
    }
    return mana;
}

