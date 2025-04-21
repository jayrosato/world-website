import { useState, useEffect } from "react";
import styles from '../styles/forum.module.css'
import { useAuth } from './UserAuth'

import Navbar from './navbar'


function CreatePost(){
    const { user } = useAuth();
    if(user){
        return(
            <a href='/forum/create'><button>Create a post</button></a>
        )
    }
    else{
        return(
            <>
                <a href='/login'>Login to create a post</a>
            </>
        )
    }
}

function LoadPosts() {

    const[posts, setPosts] = useState([])

    useEffect(() => {
        const fetchPostsJSON = async () => {
            const response = await fetch('http://localhost:3000/forum');
            const postsArray = await response.json();
    
            const newPosts = postsArray
                .filter(p => p.parent_post == null)
                .map(p => ({
                    id: p.id,
                    author: p.author,
                    authorUsername: p.username,
                    title: p.title,
                    text: p.text
                }));
    
            setPosts(newPosts);
        };
    
        fetchPostsJSON();
    }, []);

    return(
            <div className={styles.postsCont}>
                <h3>Posts:</h3>
                <div className={styles.posts}>
                {posts.map((post) => (
                    <div className={styles.post} key={post.id}>
                        <a href={`/forum/${post.id}`}> <h3>{post.title}</h3></a>
                        <h5>{post.authorUsername}</h5>
                    </div>
                    ))}
                </div>
            </div>
    )
}


export default function Forum() {

    return(
        <div>
            <Navbar />
            <div className={styles.content}>
                <CreatePost />
                <LoadPosts />
            </div>
        </div>
    );
}