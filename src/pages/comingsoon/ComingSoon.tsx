import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import "./ComingSoon.css";

export default function ComingSoon() {

  const bulb = useAnimation();
  const glow = useAnimation();
  const text = useAnimation();
  const shake = useAnimation();

  useEffect(() => {

    async function play(){

      // Camera Shake

      shake.start({
        x:[0,-6,6,-4,4,-2,2,0],
        transition:{
          duration:.35
        }
      });

      // Bulb Drop

      await bulb.start({

        y:[-700,40,-20,0],

        transition:{
          duration:1.7,
          times:[0,.8,.92,1],
          ease:"easeOut"
        }

      });

      // Flicker

      glow.start({

        opacity:[0,.2,1,.2,1,.4,1,.6,1],

        scale:[.8,1.2,1,.95,1.05,1],

        transition:{
          duration:2
        }

      });

      // Text

      text.start({

        opacity:1,

        color:"#FFE55A",

        textShadow:[
          "0 0 0px #FFD000",
          "0 0 20px #FFD000",
          "0 0 40px #FFD000",
          "0 0 80px #FFD000",
          "0 0 50px #FFD000"
        ],

        transition:{
          duration:2
        }

      });

    }

    play();

  },[]);



  return(

<motion.div
animate={shake}
className="container"
>

<div className="wire"/>

<motion.div
className="cone"
animate={glow}
/>

<motion.div

className="bulb"

initial={{y:-700}}

animate={bulb}

>

<div className="glow"/>

💡

</motion.div>


<motion.h1

className="title"

initial={{
opacity:.15
}}

animate={text}

>

COMING

<br/>

SOON

</motion.h1>

<div className="reflection"/>

<div className="particles">

{Array.from({length:40}).map((_,i)=>

<div

key={i}

className="particle"

style={{

left:`${Math.random()*100}%`,

animationDelay:`${Math.random()*5}s`,

animationDuration:`${5+Math.random()*5}s`

}}

></div>

)}

</div>

</motion.div>

  );

}