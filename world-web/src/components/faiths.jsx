import { useState, useEffect } from "react";
import styles from '../styles/faiths.module.css'

import Navbar from './navbar'
const faithGroups = ['Good', 'Evil', 'Gnostic'];

let faithNums = 3
let urls = []
for(let i=1; i<= faithNums; i++){
    let url = 'http://localhost:3000/faiths/'+i
    urls.push(url)
}

function CreateFaith({ url, viewGroup }) {
    const [name, setName] = useState('');
    const [img, setImg] = useState(null);
    const [txt, setTxt] = useState(null);
    const [group, setGroup] = useState(null);

    useEffect(() => {
        const fetchFaithJSON= async () => {
            const response = await fetch(url)
            const faithInfoArray = await response.json();

            const faithInfo = faithInfoArray[0]
            const faithName = await faithInfo.name;
            const faithImg = await faithInfo.image_source;
            const faithTxt = await faithInfo.description;
            const faithGroup = await faithInfo.faith_group;

            setName(faithName);
            setImg(faithImg);
            setTxt(faithTxt)
            setGroup(faithGroup)
        }
        fetchFaithJSON();
    }, [url]
    );

    if(viewGroup == group)
        return(
            <div className={styles.faithCard}>
                <img src={img}></img>
                <div className={styles.faithText}>
                    <h3>{name}</h3>
                    <p>{txt}</p>
                </div>
            </div>
        )
}

export default function FaithsInfo() {

    const [viewGroup, setViewGroup] = useState('Good')

    const handleClick = (group) =>{
        setViewGroup(group)
    }

    return(
    <div>
        <Navbar />
        <div className={styles.content}>
            <div className={styles.faithTabs}>
                {faithGroups.map((group) => (<button key={group} onClick={()=>handleClick(group)}>{group} </button>))}
            </div>

            <div className={styles.cards}>
                {urls.map((url) => (
                    <CreateFaith key={url} url={url} viewGroup={viewGroup}/>
                ))}
            </div>
        </div>
    </div>
    );
}