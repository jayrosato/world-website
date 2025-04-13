//import { useState } from "react";

import FaithsInfo from "./faiths";
import RealmsInfo from "./realms";

import './index.css'

import './pageHandler.css';
import { useState } from "react";
//import { useState } from "react";

export default function OrganizePage(){
    const [ActiveComponent, setActiveComponent] = useState(()=>FaithsInfo)

    return(
        <div className="content">
            <div className="sidebar">
                <button className="sidebarButton" onClick={()=>setActiveComponent(()=>FaithsInfo)}>
                    <p>Faiths</p>
                </button>
                <button className="sidebarButton" onClick={()=>setActiveComponent(()=>RealmsInfo)}>
                    <p>Realms</p>
                </button>
            </div>
            
            <div className="mainContent">
                <ActiveComponent />
            </div>
        </div>
    )
}