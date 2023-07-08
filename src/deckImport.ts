import { Card } from "./card";
import { Land } from "./land";
import { Mana } from "./mana";

const cardDatabase = require("./data/database.json");
let loaded = false;
let database: { [index: string]: any; } = {};

export function CleanDatabase() {
    /*const largeDatabase = require("./data/oracle-cards.json");
    database = JSON.parse(largeDatabase);
    let cleaned: any = {};
    for (let i = 0; i < database.length; i++) {
        const element = database[i];
        if (element["layout"] == "art_series") {
            continue;
        }
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
    let errorOutputDiv = document.getElementById('errorOutput') as HTMLDivElement;
    if (errorOutputDiv != null) {
        errorOutputDiv.innerText = "";
    }
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
    if (errorOutputDiv != null) {
        errorOutputDiv.innerText += "Deck Loaded!";
    }
    return deck;
}

function FindCardInDatabase(name: string) {
    let data = database[name];
    if (data === undefined) {
        for (let key in database) {
            if (key.indexOf("//") != -1 && key.split("//").map(s => s.trim()).indexOf(name) != -1) {
                return database[key];
            }
        }
    }
    return data;
}

export function CreateCardFromDatabase(name: string) {
    if (!loaded) {
        LoadDatabase();
    }
    let data = FindCardInDatabase(name);
    let card: Card;
    let errorOutputDiv = document.getElementById('errorOutput') as HTMLDivElement;
    if (data === undefined) {
        let message = name + " - not found in database!";
        if (errorOutputDiv != null) {
            errorOutputDiv.innerText += message+"\n";
        }
        console.error(message);
        return new Card(name, []);
    }
    let type_line: string = data["type_line"];
    let mana_cost: string = data["mana_cost"];
    let cost: Mana[] = ParseManacost(mana_cost);
    if (type_line !== undefined && type_line.indexOf("Land") != -1) {
        let produced_mana: string[] = data["produced_mana"];
        card = new Land(data.name, ParseProducedMana(produced_mana));
    } else {
        card = new Card(data.name, cost);
    }
    card.typeLine = type_line;
    return card;
}

export function ParseManacost(mana_cost: string) {
    if (mana_cost === undefined) {
        return [];
    }
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
    if (produced_mana === undefined) {
        return Mana.Colorless;
    }
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

