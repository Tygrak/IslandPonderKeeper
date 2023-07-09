import { CastabilityRequirement } from "./rules";

let globalNameIdCounter = 1;

export class CastabilityRequirementElement {
    div: HTMLDivElement;
    parent: HTMLDivElement;
    description: HTMLParagraphElement;
    castabilityRadio1: HTMLInputElement;
    castabilityRadio2: HTMLInputElement;
    castabilityRadio3: HTMLInputElement;
    castabilityRadio4: HTMLInputElement;
    castabilityRadioLabel1: HTMLLabelElement;
    castabilityRadioLabel2: HTMLLabelElement;
    castabilityRadioLabel3: HTMLLabelElement;
    castabilityRadioLabel4: HTMLLabelElement;

    constructor (parent: HTMLDivElement) {
        //todo hidden by default somehow?
        this.parent = parent;
        this.div = document.createElement('div');
        this.parent.appendChild(this.div);
        let radioName = GetUniqueInputName();
        this.description = document.createElement('div');
        this.description.innerText = "Castability requirement for rule:";
        this.div.appendChild(this.description);
        this.castabilityRadio1 = document.createElement('input');
        this.castabilityRadio1.type = "radio";
        this.castabilityRadio1.value = "None";
        this.castabilityRadio1.name = radioName;
        this.castabilityRadio1.id = GetUniqueInputName();
        this.castabilityRadio1.checked = true;
        this.castabilityRadio2 = document.createElement('input');
        this.castabilityRadio2.type = "radio";
        this.castabilityRadio2.value = "WithLands";
        this.castabilityRadio2.name = radioName;
        this.castabilityRadio2.id = GetUniqueInputName();
        this.castabilityRadio3 = document.createElement('input');
        this.castabilityRadio3.type = "radio";
        this.castabilityRadio3.value = "WithRituals";
        this.castabilityRadio3.name = radioName;
        this.castabilityRadio3.id = GetUniqueInputName();
        this.castabilityRadio4 = document.createElement('input');
        this.castabilityRadio4.type = "radio";
        this.castabilityRadio4.value = "WithRitualsT1";
        this.castabilityRadio4.name = radioName;
        this.castabilityRadio4.id = GetUniqueInputName();
        this.castabilityRadioLabel1 = document.createElement('label');
        this.castabilityRadioLabel1.innerText = "None";
        this.castabilityRadioLabel1.htmlFor = this.castabilityRadio1.id;
        this.castabilityRadioLabel2 = document.createElement('label');
        this.castabilityRadioLabel2.innerText = "With Lands";
        this.castabilityRadioLabel2.htmlFor = this.castabilityRadio2.id;
        this.castabilityRadioLabel3 = document.createElement('label');
        this.castabilityRadioLabel3.innerText = "With Rituals";
        this.castabilityRadioLabel3.htmlFor = this.castabilityRadio3.id;
        this.castabilityRadioLabel4 = document.createElement('label');
        this.castabilityRadioLabel4.innerText = "With Rituals T1";
        this.castabilityRadioLabel4.htmlFor = this.castabilityRadio4.id;
        this.div.appendChild(this.castabilityRadio1);
        this.div.appendChild(this.castabilityRadioLabel1);
        this.div.appendChild(this.castabilityRadio2);
        this.div.appendChild(this.castabilityRadioLabel2);
        this.div.appendChild(this.castabilityRadio3);
        this.div.appendChild(this.castabilityRadioLabel3);
        this.div.appendChild(this.castabilityRadio4);
        this.div.appendChild(this.castabilityRadioLabel4);
        this.div.appendChild(document.createElement("br"));
    }

    public GetValue() {
        if (this.castabilityRadio1.checked) {
            return CastabilityRequirement.None;
        } else if (this.castabilityRadio2.checked) {
            return CastabilityRequirement.CastableWithLands;
        } else if (this.castabilityRadio3.checked) {
            return CastabilityRequirement.CastableWithRituals;
        } else {
            return CastabilityRequirement.CastableWithRitualsT1;
        }
    }
}

function GetUniqueInputName() {
    let name = "castability-"+globalNameIdCounter;
    globalNameIdCounter++;
    return name;
}
