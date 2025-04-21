import { useState, useEffect } from "react";
import styles from '../styles/post.module.css'
import { useAuth } from './UserAuth'
import Navbar from "./navbar";
import { useParams } from "react-router-dom"

function Reply({ onReply }){    
    const[view, setView] = useState(false)
    const[text, setText] = useState('')
    const[errorMsg, setErrorMsg] = useState(null)
    const { postId } = useParams();
    
    const { user } = useAuth();

    async function replyToPost(){
        try{
            const response = await fetch("http://localhost:3000/forum/create", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    author: user.id,
                    title: `reply to post ${postId}`,
                    text: text,
                    parent_post: postId
                  })
            });
            const data = await response.json();

            if (response.status === 200) {
                setView(false)
                onReply()
            } 
            else {
                const errorMessages = data.errors.map(error => error.msg);
                setErrorMsg(errorMessages);
            }
        } 
        catch (err) {
            console.error('Network or server error', err);
        }
    }


    if(user){
        if(view==false){
            return(
                <button onClick={() => setView(true)}>Reply</button>
            )
        }
        if(view==true){
            return(
                <>
                    <p>Reply here:</p>
                    <input type='text' value={text} onChange={(event) => setText(event.target.value)} />
                    <button onClick={() => replyToPost()}>Submit</button>
                    <button onClick={() => setView(false)}>Nevermind</button>
                </>
            )
        }
    }
    else{
        return(
            <>
                <a href='/login'>Login to respond to this post.</a>
            </>
        )
    }
}

function LoadReplies({ reloadFlag }) {
    const { postId } = useParams();
    const[mainPost, setMainPost] = useState(null)
    const[replies, setReplies] = useState([])

    useEffect(() => {
        const fetchPostsJSON = async () => {
            const response = await fetch('http://localhost:3000/forum/'+postId);
            const postsArray = await response.json();
            const mainPost = postsArray.find(p => p.parent_post == null);
            setMainPost({
                    id: mainPost.id,
                    author: mainPost.author,
                    authorUsername: mainPost.username,
                    title: mainPost.title,
                    text: mainPost.text
            })

            const replies = postsArray
                .filter(r => r.parent_post == postId)
                .map(r => ({
                    id: r.id,
                    author: r.author,
                    authorUsername: r.username,
                    text: r.text
                }));
            setReplies(replies);
        };
    
        fetchPostsJSON();
    }, [postId, reloadFlag]);
    
    return(
            <div className={styles.postsCont}>
                <div className={styles.posts}>
                {mainPost &&
                    <div className={styles.mainPost}>
                        <h1>{mainPost.title}</h1>
                        <h3>{mainPost.authorUsername}</h3>
                        <p>{mainPost.text}</p>
                    </div>
                }
                {replies.map((post) => (
                    <div className={styles.post} key={post.id}>
                        <h3> Reply from {post.authorUsername}</h3>
                        <p>{post.text}</p>
                    </div>
                    ))}
                </div>
            </div>
    )
}



export default function PostDetail() {
    const [reloadFlag, setReloadFlag] = useState(false);
    return (
        <>
            <Navbar />
            <div className={styles.content}>
                <LoadReplies reloadFlag={reloadFlag} />
                <Reply onReply={() => setReloadFlag(prev => !prev)} />
            </div>
        </>
    )
}