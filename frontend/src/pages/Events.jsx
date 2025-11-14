import React, { useState, useEffect } from 'react'


function Events() {
    const [events,setEvents]=useState([]);
    useEffect(()=>
        {fetch('http://localhost:4000/events').
    then((data)=>data.json()).
    then((data)=>setEvents(data)).
    catch(console.log('thappa iruku na'))},[]);
  return (
    <div>
      ithu thanda events
    </div>
  )
}

export default Events