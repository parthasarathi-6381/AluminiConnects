import React, { useState, useEffect } from 'react'
import './Events.css'

function Events() {
    const [events,setEvents]=useState([]);
    useEffect(()=>
        {fetch('http://localhost:4000/events').
    then((data)=>data.json()).
    then((data)=>setEvents(data)).
    catch(console.log('thappa iruku na'))},[]);
  return (
    <div>
       <div className='s'>
        {
            events.map((event)=>{
                return <div>
                    <h4>{event.title}</h4>
                    <img src={event.image} alt="" className='event' />
                    <p>{event.tagline}</p>
                </div>
            }
           )
        }
       </div>
    </div>
  )
}

export default Events