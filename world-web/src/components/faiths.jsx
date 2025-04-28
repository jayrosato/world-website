import { useState, useEffect } from "react";
import styles from '../styles/faiths.module.css'
import Sidebar from "./Sidebar";

export default function FaithsInfo() {

    const[faiths, setFaiths] = useState([])

    useEffect(() => {
        const fetchFaithsJSON = async () => {
            const response = await fetch('http://localhost:3000/faiths');
            const faithsArray = await response.json();
            const faithsInfo = faithsArray
                .map(f => ({
                    id: f.id,
                    name: f.name,
                    desc: f.description,
                    img: f.image_source,
                    group: f.faith_group
                }));
    
            setFaiths(faithsInfo);
        };
    
        fetchFaithsJSON();
    }, []);

    const faithGroups = [...new Set(faiths.map(f => f.group))];
    const [viewGroup, setViewGroup] = useState('Good')

    function Faith(){
        for(let i=0; i<faiths.length; i++){
            let faith = faiths[i]
            if(faith.group == viewGroup){
                return(
                    <div className={styles.faithCard}>
                        <img src={faith.img}></img>
                        <div className={styles.faithText}>
                            <h3>{faith.name}</h3>
                            <p>{faith.desc}</p>
                        </div>
                    </div>
                )
            }
        }
    }

    const handleClick = (group) =>{
        setViewGroup(group)
    }
    return(
        <div className={styles.page}>
            <Sidebar />

            <div className={styles.content}>
                <div className={styles.faithTabs}>
                    {faithGroups.map((group) => {
                        if(group==viewGroup){
                            return(<button className={styles.activeTab} key={group} onClick={()=>handleClick(group)}>{group} </button>)
                        }
                        else{
                            return(<button key={group} onClick={()=>handleClick(group)}>{group} </button>)
                        }
                        })}
                </div>

                <div className={styles.cards}>
                    <Faith viewGroup={viewGroup}/>
                </div>
            </div>
        </div>
    );
}