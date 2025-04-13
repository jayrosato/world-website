import { useState } from "react";
import './realms.css'

const regionGroups = ['Media', 'Odelerg', 'The South'];


const realmTitles = ['Median Empire', 'Clovingian Kingdom', 'The Arhabu'];
const realmSymbol = ['./public/mfi_prestige.png', './public/mfi_ruthless.png', './public/mfi_sethianism.png'];
const realmTxt = ['This is the faith of the Golden Crown.', 'The faith of the Black Crown.', 'Gnostics'];
const groupingRef = ['Media', 'Odelerg', 'The South']

function createRealm(title, img, txt, group){
    return{
        title: title,
        img: img,
        txt:txt,
        group:group
    }
};

 const realms = [];

for(let i=0; i< realmTitles.length; i++){
    realms.push(createRealm(realmTitles[i], realmSymbol[i], realmTxt[i], groupingRef[i]));
};

function checkGroup(realm, group){
    return realm.group == group
}


let groupRealms = realms.filter((realm) => checkGroup(realm, 'Media'))

export default function RealmsInfo() {
    const [realmGroup, setRealmGroup] = useState(groupRealms)
    const handleClick = (group) =>{
        console.log(group)
        let groupRealm = realms.filter((realm) => checkGroup(realm, group))
        setRealmGroup(groupRealm)
    }

    return(
    <div>
        <div className="realmTabs">
        {regionGroups.map((group) => (<button key={group} onClick={()=>handleClick(group)}>{group}</button>))}
        </div>

        {realmGroup.map((realm) => (<div key={realm.title} className="realmCard">
            <img src={realm.img}></img>
            <div className="realmText">
                <h3>{realm.title}</h3>
                <p>{realm.txt}</p>
            </div>
        </div>))}
    </div>
    );
}