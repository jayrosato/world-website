import { useState, useEffect } from "react";
import styles from '../styles/post.module.css'
import { useAuth } from './UserAuth'
import Navbar from "./navbar";
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";

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

function LoadReplies({ reloadFlag, onReload }) {
    const navigate = useNavigate();
    const { postId } = useParams();
    const[mainPost, setMainPost] = useState(null)
    const[replies, setReplies] = useState([])
    const[userId, setUserId] = useState(null)
    const { user } = useAuth();
    const[errorMsg, setErrorMsg] = useState(null)
    const[msg, setMsg] = useState(null)

    useEffect(() => {
        if (user) {
            setUserId(user.id)
        }},[user])

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
                    title: r.title,
                    text: r.text
                }));
            setReplies(replies);
        };
    
        fetchPostsJSON();
    }, [postId, reloadFlag]);
    
    async function updatePost(postId, title, text) {
        const url = `http://localhost:3000/forum/${postId}/update`
        try{
            const response = await fetch(url, { 
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: postId,
                    title: title,
                    text: text
                })
            });
            const data = await response.json();
            if (response.status === 200) {
                setMsg('Post updated.')
                onReload()
            } 
            else {
                const errorMessages = data.error
                setErrorMsg(errorMessages);
            }
        }
        catch (err) {
            console.error('Network or server error', err);
        }
    }

    async function deletePost(postId, redirect) {
        const url = `http://localhost:3000/forum/${postId}/delete`
        try{
            const response = await fetch(url, { 
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: postId
                })
            });
            const data = await response.json();
            if (response.status === 200) {
                console.log(redirect)
                setMsg('Post deleted.')
                if(redirect==true){
                    navigate('/forum')
                }
                else{
                    onReload()
                } 
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
    function CheckMainPost( {post} ){
        function EditView(){
            const[editedTitle, setEditedTitle] = useState(post.title)
            const[editedText, setEditedText] = useState(post.text)
            const[editView, setEditView] = useState(false)
            if(editView == false){
                return(
                    <>
                    <h1>{mainPost.title}</h1>
                        <h3>{mainPost.authorUsername}</h3>
                        <p>{mainPost.text}</p>
                        <button onClick={() => setEditView(true)}>Edit Post</button>
                    </>
                )
            }
            if(editView == true){
                return(
                    <>
                        <p>Title</p>
                        <input value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} />
                        <p>Text</p>
                        <input value={editedText} onChange={(event) => setEditedText(event.target.value)} />
                        <button onClick = {() => updatePost(post.id, editedTitle, editedText)}>Save Changes</button>
                        <button onClick = {() => setEditView(false)}>Nevermind</button>
                        <button onClick = {() => deletePost(post.id, true)}>Delete Post</button>
                    </>
                )
            }
        }

        if(mainPost.author == userId){
            return(
                <>
                    <EditView />
                </>
            )
        }
        else{
            return(
                <>
                    <h1>{mainPost.title}</h1>
                    <h3>{mainPost.authorUsername}</h3>
                    <p>{mainPost.text}</p>
                </>
            ) 
        }
    }

    function CheckReply( {post} ){
        const[reply, setReply] = useState(post.text)
        const[editReply, setEditReply] = useState(false)
        if(post.author == userId){
            console.log(editReply)
            if(editReply == true){
                return(
                    <>
                        <input value={reply} onChange={(event) => setReply(event.target.value)} />
                        <button onClick = {() => updatePost(post.id, post.title, reply)}>Save changes</button>
                        <button onClick = {() => setEditReply(false)}>Nevermind</button>
                        <button onClick = {() => deletePost(post.id, false)}>Delete Reply</button>
                    </>
                )
            }
            if(editReply == false){
                return(
                    <>
                        <h3> Reply from {post.authorUsername}</h3>
                        <p>{post.text}</p>
                        <button onClick={() => setEditReply(true)}>Edit Reply</button>
                    </>
                )
            }
        }
        else{
            return(
                    <>
                        <h3> Reply from {post.authorUsername}</h3>
                        <p>{post.text}</p>
                    </>
            )
        }
    }

    return(
            <div className={styles.postsCont}>
                <div className={styles.posts}>
                {mainPost &&
                    <div className={styles.mainPost}>
                        <CheckMainPost post={mainPost}/>
                    </div>
                }
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                {replies.map((post) => (
                    <div className={styles.post} key={post.id}>
                        <CheckReply post={post} />
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
                <LoadReplies reloadFlag={reloadFlag} onReload={() => setReloadFlag(prev => !prev)} />
                <Reply onReply={() => setReloadFlag(prev => !prev)} />
            </div>
        </>
    )
}