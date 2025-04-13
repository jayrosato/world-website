import React, { useState } from "react";
import styles from '../styles/HomeImageCarousel.module.css'

const images = [
    '../public/desktop-wallpaper-the-rings-battle-art.jpg',
    '../public/fantasy-art-the-lord-of-the-rings-wallpaper-preview.jpg',
    '../public/lord-of-the-rings-landscape-sauron-ueamh0h9ypzkwykw.jpg'
]

export default function HomeImageCarousel() {
  const [count, setCount] = useState(0);
    function nextImg() {
        if(count >= images.length-1){
            setCount(0)
        }
        else{
        setCount(count+1)
        }
    }
    function prevImg() {
        if(count <= 0){
            setCount(images.length-1)
        }
        else{
        setCount(count-1)
        }
    }
    function CreateDots({image, index}){
        if(count == index){
            return(
                <span key={image} className={styles.active} onClick={() => setCount(index)}></span>
            )
        }
        else{
            return(
                <span key={image} className={styles.dot} onClick={() => setCount(index)}></span>
            )
        }
    }

  return (
      <div className={styles.imageCont}>
        <button className={styles.prevButton} onClick={() => prevImg()}>&#10094;</button>
        <img className={styles.image} src={images[count]}/>
        <button className={styles.nextButton} onClick={() => nextImg()}>&#10095;</button>
        <div className={styles.dots}>
            {images.map((image, index) => (
                <CreateDots key={image} image={image} index={index}  />
            ))}
        </div>

    </div>
  );
}